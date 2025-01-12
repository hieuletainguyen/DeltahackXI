import openai
import speech_recognition as sr
import pyttsx3
import os

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
    except openai.error.RateLimitError as e:
        print("Rate limit exceeded. Please check your OpenAI API quota and billing details.")
        raise
    except openai.error.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        raise
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
    except openai.error.RateLimitError as e:
        print("Rate limit exceeded. Please check your OpenAI API quota and billing details.")
        raise
    except openai.error.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        raise
    except Exception as e:
        print(f"Error in chat completion: {e}")
        raise



def main():

    # Step 1: Record audio and save to file
    audio_filename = record_audio_to_file()
        
    # Step 2: Transcribe audio
    print("Transcribing audio...")
    transcribed_text = transcribe_audio(audio_filename)
    print("You said:", transcribed_text)
        

        
    # Step 3: Send the transcribed text to ChatGPT
    print("Sending to ChatGPT...")
    chat_response = chat_with_gpt(transcribed_text)
    print("chat_response:", chat_response)
        
    # Step 4: Parse the response
    exec_part = chat_response  # Default if format not matched
    response_part = ""
    delimiter = "], [Response:"
    if delimiter in chat_response:
        parts = chat_response.split(delimiter, 1)
        exec_part = parts[0] + "]"  # Add back the closing bracket for execution part
        response_part = "[Response:" + parts[1]  # Reconstruct the response part
        

    print("Execution Portion:", exec_part)
    engine = pyttsx3.init()
    engine.say(chat_response)
    engine.runAndWait()

    
if __name__ == "__main__":
    main()       