import multiprocessing
import os

def run_proxy_server():
    os.system('python3 /Users/daisy./Documents/info\ 492/chrome\ extension/Chrome\ Extension/proxy_server.py')

def run_app():
    os.system('python3 /Users/daisy./Documents/info\ 492/chrome\ extension/Chrome\ Extension/app.py')

if __name__ == '__main__':
    # Create multiprocessing processes
    process1 = multiprocessing.Process(target=run_proxy_server)
    process2 = multiprocessing.Process(target=run_app)
    
    # Start the processes
    process1.start()
    process2.start()
    
    # Join the processes to ensure they run concurrently
    process1.join()
    process2.join()