import socket
import webbrowser
import threading
import time
import uvicorn
import os
import sys

def find_available_port(start_port=8082, max_attempts=20):
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    return start_port

def open_browser(port):
    time.sleep(1.5)
    url = f"http://127.0.0.1:{port}"
    print(f"\n=======================================================")
    print(f"🌲 EVERGREEN CHRONICLES — Medieval x Modern Fantasy RPG")
    print(f"🎮 Game Engine Live at: {url}")
    print(f"📖 Interactive API Docs at: {url}/docs")
    print(f"=======================================================\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    target_port = find_available_port(8082)
    # Start thread to open browser
    threading.Thread(target=open_browser, args=(target_port,), daemon=True).start()
    
    # Run uvicorn server
    uvicorn.run("app.main:app", host="127.0.0.1", port=target_port, reload=False)
