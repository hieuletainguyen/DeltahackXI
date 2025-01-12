import openai
import speech_recognition as sr
import pyttsx3
import os
import keyboard
import time
from flask import Flask, jsonify
from flask_cors import CORS  # You'll need to install this: pip install flask-cors


# openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = "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"
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


def chat_with_gpt(user_input, start_time="12:00", end_time="12:10", initial_voltage="60"):
    """ send a prompt to chatgpt and return the response"""
    
    system_prompt = f"""
    You are a command interpreter for an EV charging station assistant. 
    You have four attributes: station, time, start voltage, and end voltage.
    Your ranges for these attributes are: station:McDonalds Charger, McMaster Charger, Ikea Charger, Walmart Charger, Target Charger; time: 00:00 to 23:59; start voltage is the initial voltage number; end voltage is the increase/decrease user mentionted +/- start voltage
    start_time = {start_time}
    end_time = {end_time}
    initial_voltage = {initial_voltage}
    
    **Requirements:**
    1. Figure out from the user's request which attribute they want to change (or if they want to retrieve info).
    2. Respond in a specific format or short answer as demonstrated in the examples below.

    **Examples:**
    - If the user says: "I want to move the time interval ten minutes later."
    You might respond: "[Execution: setTime: <start_time> + 10 - <end_time> + 10], [Response: Ok! Your new booked time is <start_time> + 10 - <end_time> + 10.]"


    - If the user says: "Change the station to <name>."
    You might respond: "[Execution: setStation: station <name>], [Response: "Ok! Changing your station to station <name>.]"

    - If the user says: "Increase the voltage by <number>"
    You might respond: "[Execution: setVoltage: initial voltage + <number>], [Response: Ok! Changing your voltage to station initial voltage + <number>.]"
    
    - If the user says: "Decrease the voltage by <number>"
    You might respond: "[Execution: setVoltage: decrease voltage + <number>], [Response: Ok! Changing your voltage to station initial voltage + <number>.]"
    
    Edge cases:
    -If the user is too vague with their answer and says the following:
    
    "Increase the voltage by a little bit"
    You might respond: "[Execution: setVoltage: initial voltage + 5], [Response: Changing your voltage to station initial voltage + 5, is that okay?]"
    
    "Change the station to Mac Charger"
    You might respond: "[Execution: setStation: McMaster Charger], [Response: Ok! Changing your station to station McMaster Charger.]"

    
    "I want to move the time interval"
    You might respond: "[Response: Would you like to have your new time interval be sooner or later? And by how many minutes?]"
    
    When you’re uncertain, try your best to infer the user's meaning. Always respond in a concise format, referencing the correct attribute.
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
            response_part = ""
            delimeter = "], [Response:"
            if delimeter in chat_response:
                parts = chat_response.split(delimeter, 1)
                exec_part = parts[0] + "]"
                response_part = "[Response:" + parts[1]
                print("Execution Portion:", exec_part)
                print("Response Portion:", response_part)
            
            #speak the "response" portion
            engine.say(response_part if response_part else chat_response)
            engine.runAndWait()

    
if __name__ == "__main__":
    main()       

app = Flask(__name__)
CORS(app)

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
    app.run(port=5000)       