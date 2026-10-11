import os
import zipfile

CANDIDATE_ZIP = "PRAN_NET_Candidate_Release_v1.1.0_AWS_Ready.zip"

EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".idea",
    ".vscode",
    "dist",
    "build",
    ".gradle",
}

EXCLUDE_FILES = {
    CANDIDATE_ZIP,
    ".DS_Store",
    "thumbs.db",
}

EXCLUDE_EXTS = {
    ".pyc",
    ".pyo",
    ".zip",
    ".tmp",
    ".log",
}

def should_exclude(root, name, is_dir=False):
    parts = os.path.normpath(root).split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True
    if is_dir:
        return name in EXCLUDE_DIRS
    if name in EXCLUDE_FILES:
        return True
    _, ext = os.path.splitext(name)
    if ext.lower() in EXCLUDE_EXTS:
        return True
    return False

def package_candidate():
    file_count = 0
    with zipfile.ZipFile(CANDIDATE_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if not should_exclude(root, d, is_dir=True)]
            for file in sorted(files):
                if should_exclude(root, file, is_dir=False):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, ".").replace("\\", "/")
                zf.write(file_path, arcname)
                file_count += 1

    size_mb = os.path.getsize(CANDIDATE_ZIP) / (1024 * 1024)
    print(f"Candidate packaged: {file_count} files into {CANDIDATE_ZIP} ({size_mb:.2f} MB)")

    with zipfile.ZipFile(CANDIDATE_ZIP, "r") as zf:
        bad = zf.testzip()
        if bad:
            print(f"CRC ERROR in {bad}")
            return False
        print("Candidate CRC test: 100% OK, zero corruption.")
        return True

if __name__ == "__main__":
    package_candidate()
