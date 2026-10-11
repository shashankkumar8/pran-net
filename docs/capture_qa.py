import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
output_dir = r"C:\Users\LENOVO\Downloads\PRAN_NET_Final_Project_Source_Package\PRAN_NET_Antigravity_Polish_Pack\schoolair-ledger\docs\audit_screenshots"
os.makedirs(output_dir, exist_ok=True)

targets = [
    ("qa_01_overview_desktop_dark.png", "http://localhost:5173/?view=overview&theme=dark", "1280,800"),
    ("qa_02_overview_desktop_light.png", "http://localhost:5173/?view=overview&theme=light", "1280,800"),
    ("qa_03_overview_desktop_urdu_rtl.png", "http://localhost:5173/?view=overview&theme=dark&lang=ur", "1280,800"),
    ("qa_04_overview_mobile_390px.png", "http://localhost:5173/?view=overview&theme=dark", "390,844"),
    ("qa_05_map_desktop.png", "http://localhost:5173/?view=vayu&theme=dark", "1280,800"),
    ("qa_06_map_mobile_390px.png", "http://localhost:5173/?view=vayu&theme=dark", "390,844"),
    ("qa_07_pollution_analysis_desktop.png", "http://localhost:5173/?view=whybad&theme=dark", "1280,800"),
    ("qa_08_pollution_analysis_mobile_390px.png", "http://localhost:5173/?view=whybad&theme=dark", "390,844"),
    ("qa_09_wind_weather_desktop.png", "http://localhost:5173/?view=downwind&theme=dark", "1280,800"),
    ("qa_10_wind_weather_mobile_390px.png", "http://localhost:5173/?view=downwind&theme=dark", "390,844"),
    ("qa_11_sector_municipal_desktop.png", "http://localhost:5173/?view=sectors&tab=municipal&theme=dark", "1280,800"),
    ("qa_12_sector_logistics_desktop.png", "http://localhost:5173/?view=sectors&tab=logistics&theme=dark", "1280,800"),
    ("qa_13_sector_campus_desktop.png", "http://localhost:5173/?view=sectors&tab=campus&theme=dark", "1280,800"),
    ("qa_14_sector_agriculture_desktop.png", "http://localhost:5173/?view=sectors&tab=agriculture&theme=dark", "1280,800"),
    ("qa_15_sector_mobile_390px.png", "http://localhost:5173/?view=sectors&tab=municipal&theme=dark", "390,844"),
    ("qa_16_action_review_desktop.png", "http://localhost:5173/?view=review&theme=dark", "1280,800"),
    ("qa_17_action_review_mobile_390px.png", "http://localhost:5173/?view=review&theme=dark", "390,844"),
    ("qa_18_action_history_desktop.png", "http://localhost:5173/?view=ledger&theme=dark", "1280,800"),
    ("qa_19_action_history_mobile_390px.png", "http://localhost:5173/?view=ledger&theme=dark", "390,844"),
    ("qa_20_data_evidence_desktop.png", "http://localhost:5173/?view=sources&theme=dark", "1280,800"),
    ("qa_21_data_evidence_mobile_390px.png", "http://localhost:5173/?view=sources&theme=dark", "390,844"),
    ("qa_22_methods_guidance_desktop.png", "http://localhost:5173/?view=methodology&theme=dark", "1280,800"),
    ("qa_23_methods_guidance_mobile_390px.png", "http://localhost:5173/?view=methodology&theme=dark", "390,844"),
]

for filename, url, win_size in targets:
    out_file = os.path.join(output_dir, filename)
    cmd = [
        chrome_path,
        "--headless=new",
        "--hide-scrollbars",
        f"--window-size={win_size}",
        f"--screenshot={out_file}",
        url,
    ]
    subprocess.run(cmd, capture_output=True)
    size = os.path.getsize(out_file) if os.path.exists(out_file) else 0
    print(f"{filename} ({win_size}): {size} bytes")
