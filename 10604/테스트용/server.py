import os
import socket
import webbrowser
import http.server
import socketserver
from http import HTTPStatus

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    """같은 Wi-Fi(네트워크)에서 스마트폰으로 접속할 수 있는 로컬 IP 확인"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # 개발 및 축제 테스트 시 캐시로 인한 새로고침 미적용 방지
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # 접속 로그 간결하게 출력
        print(f"[{self.log_date_time_string()}] {self.client_address[0]} -> {args[0]}")

def main():
    local_ip = get_local_ip()
    url_local = f"http://localhost:{PORT}"
    url_network = f"http://{local_ip}:{PORT}"

    print("=" * 65)
    print(" 🏫 경북대사대부고 축제 탈출 게임 [검은 그늘 속에서] 로컬 서버")
    print("=" * 65)
    print(f" 💻 [내 컴퓨터 접속]   : {url_local}")
    print(f" 📱 [스마트폰/태블릿]   : {url_network}")
    print("-" * 65)
    print(" 💡 축제 부스 활용 팁:")
    print("   - 노트북과 스마트폰을 같은 학교 Wi-Fi나 핫스팟에 연결하면")
    print(f"     스마트폰 브라우저에 '{url_network}' 를 입력하여 바로 플레이할 수 있습니다!")
    print("   - 서버를 종료하려면 [Ctrl + C]를 누르세요.")
    print("=" * 65)

    # 기본 브라우저 자동 실행
    try:
        webbrowser.open(url_local)
    except Exception:
        pass

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 서버가 안전하게 종료되었습니다.")

if __name__ == "__main__":
    main()
