import time
from datetime import datetime

import requests

from config import (
    BACKEND_URL,
    AGENT_NAME,
    HEARTBEAT_INTERVAL,
)


def connect():
    url = f"{BACKEND_URL}/agent/connect"

    try:
        response = requests.post(
            url,
            params={
                "agent_name": AGENT_NAME
            },
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        print("✓ UNUM serveriga ulandi")
        print(f"✓ Agent: {data['agent_name']}")
        print(f"✓ Status: {data['status']}")

        return True

    except requests.RequestException as error:
        print("✗ Serverga ulanib bo‘lmadi")
        print(f"  Xatolik: {error}")

        return False


def heartbeat():
    url = f"{BACKEND_URL}/agent/heartbeat"

    try:
        response = requests.post(
            url,
            params={
                "agent_name": AGENT_NAME
            },
            timeout=10,
        )

        response.raise_for_status()

        data = response.json()

        print(
            f"♥ Agent online | "
            f"{datetime.now().strftime('%H:%M:%S')}"
        )

        return True

    except requests.RequestException:
        print("✗ Heartbeat yuborilmadi")

        return False


def main():
    print("=" * 55)
    print("                 UNUM SAVDO")
    print("                   AGENT")
    print("=" * 55)

    print()
    print(f"Agent nomi: {AGENT_NAME}")
    print(f"Server: {BACKEND_URL}")
    print()

    while True:

        if connect():
            break

        print("5 soniyadan keyin qayta uriniladi...")
        time.sleep(5)

    print()
    print("Agent ishlayapti.")
    print("Server bilan aloqa nazorat qilinmoqda.")
    print()

    while True:
        heartbeat()
        time.sleep(HEARTBEAT_INTERVAL)


if __name__ == "__main__":
    main()