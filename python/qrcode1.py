import datetime
import qrcode as qrcode_lib
from qrcode import QRCode
import os



#1. simulate a booking record
#suppose the user booked machine "machine a" for 11:00 to 11:20


def generate_qr_code(data: str, filename: str):
    """
    generate a qr code from the 'data' string and 
    save it as a png file named 'filename'
    """
    #create a qr code object
    qr = qrcode_lib.QRCode(
        version=1,
        box_size=10,
        border=4,
    )
    #add data to the qr code
    qr.add_data(data)
    qr.make(fit=True)
    
    #create an image from the QR code
    img = qr.make_image(fill_color="black", back_color="white")
    #save image file
    img.save(filename)
    print(f"Saved QR code to {filename}")
    print(f"Saved QR code to {os.path.abspath(filename)}")

def check_qr_code(qr_code_id: str, booking: dict) -> None:
    """
    Checks the scanned QR code against a bookings machine_id and
    verifies it if the current time is within the booking window.
    """
    
    now = datetime.datetime.now()
    
    #check if qr code matches the booked machine
    if qr_code_id != booking["machine_id"]:
        print("Error: This QR code does not match your booked machine.")
        return

    #if machine_id matches, check time window:
    start_time = booking["start_time"]
    end_time = booking["end_time"]
    
    print(f"Scanned QR: {qr_code_id}")
    print(f"Start Time: {start_time}, End Time: {end_time}, Now: {now}")
    
    if start_time <= now <= end_time:
        print("Activation confirmed!\n")
    else:
        print("Time slot missed, please book another timeslot.\n")
  
  

    
booking_info_1 = {
    "machine_id": "machine_a",
    # Past time slot (e.g., 19:00 - 19:40)
    "start_time": datetime.datetime(2025, 1, 11, 19, 0),
    "end_time": datetime.datetime(2025, 1, 11, 19, 40)
}

booking_info_2 = {
    "machine_id": "machine_a",
    # Current/future time slot (e.g., 20:30 - 21:30)
    "start_time": datetime.datetime(2025, 1, 11, 20, 30),
    "end_time": datetime.datetime(2025, 1, 11, 21, 30)
}

def main():
    # Uncomment if you haven't yet generated QR codes:
    #generate_qr_code("machine_a", "machine_a.png")
    #generate_qr_code("machine_b", "machine_b.png")
    
    print("=== Testing with booking_info_1 (past slot) ===")
    # Case 1a: Scanning with correct machine_id "machine_a"
    check_qr_code("machine_a", booking_info_1)
    
    # Case 1b: Scanning with incorrect machine_id "machine_b"
    check_qr_code("machine_b", booking_info_1)
    
    print("=== Testing with booking_info_2 (current/future slot) ===")
    # Case 2a: Scanning with correct machine_id "machine_a"
    check_qr_code("machine_a", booking_info_2)
    
    # Case 2b: Scanning with incorrect machine_id "machine_b"
    check_qr_code("machine_b", booking_info_2)
    


if __name__ == "__main__":
    main()
    
