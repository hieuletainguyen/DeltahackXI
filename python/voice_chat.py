import openai
import speech_recognition as sr
import pyttsx3
import os
import keyboard
import time
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS  
import json
global execution_response
execution_response = "123"
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def record_audio_to_file(filename="input.wav"):
    """ record audio from the microphone and save it to a WAV file"""
    try:
        r = sr.Recognizer()
        with sr.Microphone() as source:
            print("Please speak now...")
            audio = r.listen(source)
        with open(filename, "wb") as f:
            f.write(audio.get_wav_data())
        
        return filename
    except sr.RequestError as e:
        print(f"Could not request results; {e}")
        raise
    except sr.UnknownValueError:
        print("Could not understand audio")
        raise
    except Exception as e:
        print(f"Error recording audio: {e}")
        raise

def transcribe_audio(filename):
    """Use openai whisper API to transcribe audio from a file"""
    try:
        with open(filename, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
        return transcript["text"]
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        raise


def chat_with_gpt(user_input, start_time="18:00", end_time="19:00", initial_voltage="40", end_voltage="80", station_name=[]):
    with open('nearest_stations.json', 'r') as json_file:
        station_name = json.load(json_file)
        print(station_name)

    """ send a prompt to chatgpt and return the response"""
    
    system_prompt = f"""
    You are a command interpreter for an EV charging station assistant. 
    You have four attributes: station, time, start voltage, and end voltage.
    Your ranges for these attributes are: station: {station_name}; time: 00-00 to 23-59; start voltage is the initial voltage number spanning from 0 to 90; end voltage is the expected voltage after charging, it should always be above initial voltage
    start_time = {start_time}
    end_time = {end_time}
    initial_voltage = {initial_voltage}
    end_voltage = {end_voltage}
    
    **Requirements:**
    1. Figure out from the user's request which attribute they want to change (or if they want to retrieve info).
    2. Respond in a specific format or short answer as demonstrated in the examples below.
    3. the execution format for time is for example: [Execution: setTime: 18-00/19-00]
    4. when given a station name, find the closest name to the station name user inputed
    5. I the response, you should say 7pm instead of 19:00 and 6pm instead of 18:00
    **Examples:**
    - If the user says: "I want to move the time interval ten minutes later."
    You might respond: "[Execution: setTime: <start_time + 10>/<end_time + 10>]|[Response: Ok! Your new booked time is <start_time + 10>/<end_time + 10>]"
    You might respond: "[Execution: setTime: 12-10/12-20]|[Response: Ok! Your new booked time is from twelve ten to twelve twenty]"

    - If the user says: "What's the closest location?"
    You might respond: "[]|[Response: The closest location is <station_name> from <start_time> to <end_time>, charging you from <initial_voltage> percent to <end_voltage> percent]"

    - If the user says: "Repeat the order for me"
    You might respond: "[]|[Response: your order is at <station_name> from <start_time> to <end_time>, charging from <initial_voltage> percent to <expected_voltage> percent]
    For example: "[]|[your order is at Hayes Street Grill from 12:30 to 13:10, charging from 20 percent to 60 percent]

    - If the user says: "Change the station to <station_name>."
    You might respond: "[Execution: setStation: <station_name>]|[Response: "Ok! Changed your station to <station_name>.]

    - If the user says: "Change the voltage from <start_voltage> to <end_voltage>"
    You might respond: "[Execution: setVoltage: <start_voltage>/<end_voltage>]|[Response: Ok! Changing your voltage from <start_voltage> percent to <end_voltage> percent.]"
    
    - If the user says: "Change the time from <start_time> to <end_time>"
    You might respond: "[Execution: setTime: <start_time>/<end_time>]|[Response: Ok! Changing your time from <start_time> to <end_time>.]"
    For example: "[Execution: setTime: 18-00/19-00]|[Response: Ok! Changing your time from 6 pm to 7 pm.]"

    - If the user says: "Increase the end voltage by <number>"
    You might respond: "[Execution: setVoltage: <start_voltage>/<end_voltage>]|[Response: Ok! Changing your ending voltage to  end_voltage + <number>.]"
    
    - If the user says: "Decrease the end voltage by <number>"
    You might respond: "[Execution: setVoltage: decrease <start_voltage>/<end_voltage>]|[Response: Ok! Changing your ending voltage to end_voltage - <number>.]"
    
    - If the user says: "I want to set my voltage from 30 percent to 40 percent and move the time interval ten minutes later."
    You might respond: [Execution: setVoltage: <start_voltage>/<end_voltage>][Execution: setTime: <start_time plus ten minutes>/<end_time plus ten minutes>]|[Response: Ok! Changing your end voltage to end_voltage + <number> and your new booked time is <start_time plus ten minutes>/<end_time plus ten minutes>.]
    You might respond: [Execution: setVoltage: 30/40][Execution: setTime: 12-00/13-00]|[Response: Ok! Changing your voltage from 30 to 40 and your new booked time is 12 o clock to13 o clock.]
    
    - If the user says: "I want to book the time interval"
    You might respond: "[Execution: submit]|[Response: Ok! You've booked at <station_name> from <start_time> to <end_time>, charging from <initial_voltage> percent to <end_voltage> percent]"
    
    - If the user says: "Submit form"
    You might respond: "[Execution: submit]|[Response: Ok! You've booked at <station_name> from <start_time> to <end_time>, charging from <initial_voltage> percent to <end_voltage> percent]"
    For example: "[Execution: submit]|[Response: Ok! You've booked at Esso from 6 pm to 7 pm, charging from 40 percent to 80 percent]"

    Edge cases:
    -If the user is too vague with their answer and says the following: 
    
    "Increase the end voltage by a little bit"
    You might respond: "[Execution: setVoltage: <start_voltage>/<end_voltage + 5>]|[Response: Changed your ending voltage to <end_voltage + 5>]"
    
    "Increase the initial voltage by a 5 percent"
    You might respond: "[Execution: setVoltage: <start_voltage + 5>/<end_voltage>]|[Response: Changed your initial voltage to <start_voltage + 5>]"
    
    "Change the station to Zuni Cafe"
    You might respond: "[Execution: setStation: Zuni Cafe]|[Response: Ok! Changing your station to station Zuni Cafe.]"

    
    "I like apples"
    You might respond: "[]|[Response: Sorry, I don't understand that.]"
    
    When you’re uncertain, try your best to infer the user's meaning. Always respond in a concise format, referencing the correct attribute. If the user didn't mention the value of a value, you should assume it stays the same.
    """


    messages = [
        {"role": "system", "content": system_prompt.strip()},
        {"role": "user", "content": user_input.strip()}
    ]
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        return response["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error in chat completion: {e}")
        raise


def main():
    engine = pyttsx3.init()
    print("Voice dictation ready. Press SPACE to record. Press ESC to end the program")
    
    while True:
        # Check for ESC key first
        if keyboard.is_pressed("esc"):
            print("Exiting voice dictation")
            break
            
        # Check for space bar press
        if keyboard.is_pressed("space"):
            # simple debounce: wait for user to release space
            time.sleep(0.2)
            while keyboard.is_pressed("space"):
                pass  # keep waiting until they let go of space
            
            #step 1 record audio and save to file
            audio_filename = record_audio_to_file()
            
            #step 2: transcribe audio
            print("Transcribing audio...")
            try:
                transcribed_text = transcribe_audio(audio_filename)
                print("You said:", transcribed_text)
            except Exception as e:
                print("Transcription failed. Please try again")
                continue
            #check if user said "quit"
            if transcribed_text.strip().lower() == "quit":
                print("Exiting voice dictation")
                break
            
            #step 3: send transcrbed to chatgpt
            print("Sending to ChatGPT...")
            try:
                chat_response = chat_with_gpt(transcribed_text)
                print("chat_response:", chat_response)
            except Exception as e:
                print("ChatGPT interaction failed. Please try again.")
                continue
            
            #step4 parse response
            exec_part = chat_response
            
            delimeter = "]|[Response:"
            global execution_response
            response_part = ""
            if delimeter in chat_response:
                parts = chat_response.split(delimeter, 1)
                exec_part = parts[0] + "]"
                response_part = parts[1]
                print("Execution Portion:", exec_part)
                print("Response Portion:", response_part)
                execution_response = exec_part
                

                try:
                    with open('execution_response.json', 'w') as json_file:
                        json.dump({"execution_response": exec_part}, json_file)
                    print("Execution response saved to execution_response.json")
                except Exception as e:
                    print(f"Error saving execution response to JSON file: {e}")
            #speak the "response" portion
            engine.say(response_part if response_part else chat_response)
            engine.runAndWait()

    
if __name__ == "__main__":
    main()       

app = Flask(__name__)
CORS(app)

@app.route('/execution_return', methods=['GET'])
def execution_return():
    return jsonify({
        "success": True,
        "response": execution_response
    })

@app.route('/start-voice-chat', methods=['POST'])
def start_voice_chat():
    try:
        engine = pyttsx3.init()
        
        # Record and process single voice input
        audio_filename = record_audio_to_file()
        
        print("Transcribing audio...")
        transcribed_text = transcribe_audio(audio_filename)
        print("You said:", transcribed_text)
        
        print("Sending to ChatGPT...")
        chat_response = chat_with_gpt(transcribed_text)
        print("chat_response:", chat_response)
        
        # Parse response
        exec_part = chat_response
        response_part = ""
        delimeter = "], [Response:"
        if delimeter in chat_response:
            parts = chat_response.split(delimeter, 1)
            exec_part = parts[0] + "]"
            response_part = "[Response:" + parts[1]
        # Save the execution response to a JSON file
        
        # Speak the response
        engine.say(response_part if response_part else chat_response)
        engine.runAndWait()
        
        return jsonify({
            "success": True,
            "transcribed_text": transcribed_text,
            "response": chat_response
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8989, debug=True)       