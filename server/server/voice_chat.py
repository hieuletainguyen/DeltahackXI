import openai
import speech_recognition as sr
import pyttsx3

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
    except openai.error.RateLimitError as e:
        print("Rate limit exceeded. Please check your OpenAI API quota and billing details.")
        raise
    except openai.error.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        raise
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        raise


def chat_with_gpt(user_input):
    """ send a prompt to chatgpt and return the response"""
    
    system_prompt = """
    You are a command interpreter for an EV charging station assistant. 
    You have four attributes: price, station, time, and voltage.

    **Requirements:**
    1. Figure out from the user's request which attribute they want to change (or if they want to retrieve info).
    2. Respond in a specific format or short answer as demonstrated in the examples below.

    **Examples:**
    - If the user says: "I want to move the time interval ten minutes later."
    You might respond: "Execution: setTime: 12:30 - 12:40"

    - If the user says: "Change the station to station2."
    You might respond: "Ok! Changing your station to station2."

    - If the user says: "Increase the voltage to 240."
    You might respond: "Execution: setVoltage to 240."

    - If the user says: "Update the price to $10."
    You might respond: "Execution: setPrice: 10."

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
    #step 1: record audio and save to file
    audio_filename = record_audio_to_file()
    #step2: transcribe the recorded audio
    print("Transcribing audio...")
    transcribed_text = transcribe_audio(audio_filename)
    print("You said:", transcribed_text)


    #step 3 send the transcribed text to chatgpt
    print("Sending to chatgpt")
    chat_response = chat_with_gpt(transcribed_text) 
    
    #step 4 output chatgpts response
    print("ChatGPT Response")
    print(chat_response)
    
    engine = pyttsx3.init()
    engine.say(chat_response)
    engine.runAndWait()
    
if __name__ == "__main__":
    main()       