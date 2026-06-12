import React, { Component } from 'react';
import './Text2Speech.css';

class Text2Speech extends Component {
  constructor(props) {
    super(props);
    this.state = {
      speech: '',
      start: true
    };
  }

  // 🎤 Start voice recognition
  startVoice = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-IN';

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("You said:", transcript);

      this.setState({ speech: transcript });

      // 👉 Send to backend
      this.sendToBackend(transcript);
    };
  };

  // 📡 Send to backend
  sendToBackend = (text) => {
    fetch("http://localhost:3001/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Backend response:", data);

      // 🔊 Speak backend response
      this.speak(data.response || "No result found");
    })
    .catch(err => console.log(err));
  };

  // 🔊 Speak function
  speak = (text) => {
    const synth = window.speechSynthesis;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onend = () => {
      console.log('Done speaking...');
    };

    utterance.onerror = () => {
      console.error('Something went wrong');
    };

    synth.speak(utterance);
  };

  render() {
    return (
      <div className='wrapped container'>
        <textarea
          value={this.state.speech}
          readOnly
          className="form-control form-control-lg"
          placeholder="Click Speak and talk..."
        ></textarea>

        {/* 🎤 Voice Button */}
        <button
          className="btn btn-dark btn-lg btn-block"
          onClick={this.startVoice}
        >
          🎤 Speak
        </button>
      </div>
    );
  }
}

export default Text2Speech;









