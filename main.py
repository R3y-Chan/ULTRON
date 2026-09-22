from brain.brain import ask_brain

print("Ultron Online...    ")

def main():
    while True:
        user_input = input("you : ")
        if user_input.lower() == "exit" :
            print("Ultron: Shutting Down")
            break
        response = ask_brain(user_input)
        print("ULTRON:", response)


main()
