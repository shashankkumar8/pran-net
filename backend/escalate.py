"""Every 15 min: if a MOVE_INDOORS advisory has gone unreviewed past the window, send ONE SNS email (at-most-once claim)."""
import time
from datetime import datetime, timezone
import boto3
from boto3.dynamodb.conditions import Key
from engine import build_station_advisory
from common import cfg, table, school, latest_observations, to_ddb, from_ddb

def _publish(**kw):
    boto3.client("sns").publish(**kw)

def handler(event=None, context=None, now=None):
    now = now or time.time()
    s = school()
    adv = build_station_advisory(latest_observations(now), "outdoor_assembly", now, s["lat"], s["lon"])
    if adv.get("decision_code") != "MOVE_INDOORS":
        return {"escalated": False, "reason": "no severe fresh advisory"}
    led, pk = table("LEDGER_TABLE"), f"SCHOOL#{s['school_id']}"
    sk = "ALERT#" + adv["evidence"]["observed_at"]
    iso_now = datetime.fromtimestamp(now, timezone.utc).isoformat()
    try:   # first detection of this reading
        led.put_item(Item=to_ddb({"pk": pk, "sk": sk, "detected_at": iso_now, "detected_epoch": int(now),
                                  "station_id": adv["evidence"]["station_id"], "data_status": adv["evidence"].get("data_status")}),
                     ConditionExpression="attribute_not_exists(pk)")
    except Exception as exc:
        if "ConditionalCheckFailed" not in str(exc):
            raise
    alert = from_ddb(led.get_item(Key={"pk": pk, "sk": sk})["Item"])
    if alert.get("notified_at") or alert.get("reviewed"):
        return {"escalated": False, "reason": "already handled"}
    acts = led.query(KeyConditionExpression=Key("pk").eq(pk) & Key("sk").begins_with("ACT#"), ScanIndexForward=False, Limit=1)["Items"]
    if acts and from_ddb(acts[0])["created_at"] >= alert["detected_at"]:
        led.update_item(Key={"pk": pk, "sk": sk}, UpdateExpression="SET reviewed = :t", ExpressionAttributeValues={":t": True})
        return {"escalated": False, "reason": "reviewed"}
    if now - alert["detected_epoch"] < s["escalate_after_min"] * 60:
        return {"escalated": False, "reason": "within review window"}
    try:   # claim first => at-most-once email
        led.update_item(Key={"pk": pk, "sk": sk}, UpdateExpression="SET notified_at = :n",
                        ConditionExpression="attribute_not_exists(notified_at)", ExpressionAttributeValues={":n": iso_now})
    except Exception as exc:
        if "ConditionalCheckFailed" in str(exc):
            return {"escalated": False, "reason": "already claimed"}
        raise
    label = "SAMPLE DATA (test)" if adv["evidence"].get("data_status") == "sample" else "observed"
    _publish(TopicArn=cfg("ALERT_TOPIC_ARN"), Subject="SchoolAir Ledger: unreviewed severe air advisory",
        Message=(f"{s['name']}: advisory {adv['decision_code']} ({adv['evidence'].get('aqi_category')}, {label} at {adv['evidence']['observed_at']}) "
                 f"has had no recorded decision for {s['escalate_after_min']}+ minutes. Review it in SchoolAir Ledger. "
                 "Station readings are not personal exposure; this is decision support, not an official order."))
    return {"escalated": True}
