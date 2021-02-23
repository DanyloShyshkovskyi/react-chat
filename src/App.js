import React, { useRef, useState } from 'react';
import './App.css';
import  pict from './man.svg';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleLoginButton,FacebookLoginButton,GithubLoginButton } from "react-social-login-buttons";

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCyvh9LIiJF0qDuTAToeTbM-mE8x4FCXME",
    authDomain: "shyshkovskyi-smoilovskyi-chat.firebaseapp.com",
    projectId: "shyshkovskyi-smoilovskyi-chat",
    storageBucket: "shyshkovskyi-smoilovskyi-chat.appspot.com",
    messagingSenderId: "1059185687298",
    appId: "1:1059185687298:web:c17bb8e6e3d3f4778a201b",
    measurementId: "G-VNN0574L8Z"

})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>S&S chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  const signInWithGitHub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(provider);
  }

  const signInWithFacebook = () => {
    var provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider);
  }

  const anonymSinng = () => {
    firebase.auth().signInAnonymously()
  .then(() => {
    // Signed in..
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });
  }
  console.log()
  return (
    <div className="signIn">
      <GoogleLoginButton  onClick={signInWithGoogle} />
      <FacebookLoginButton onClick={signInWithFacebook} />
      <GithubLoginButton onClick={signInWithGitHub} />
      {/*<button className="sign-in" onClick={anonymSinng}>anonymSinng</button>*/}
    </div>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { displayName,uid, photoURL,email } = auth.currentUser;

    await messagesRef.add({
      email,
      displayName,
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}

function Card(props){
  return(
      <div class="our-team">
        <div class="picture">
          <img class="img-fluid" src={props.photoURL}/>
        </div>
        <div class="team-content">
          <h3 class="name">{props.name}</h3>
          <h4 class="title">{props.email}</h4>
        </div>
      </div>
  )
}

function MyVerticallyCenteredModal(props) {
  console.log(props.photoURL)
  return (
    <Modal
      {...props}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body>
      <Card
      name = {props.name}
      email = {props.email}
      photoURL = {props.photoURL}
      />
      </Modal.Body>
    </Modal>
  );
}


function ChatMessage(props) {
  const { displayName,text, uid, photoURL ,email} = props.message;
  const [modalShow, setModalShow] = React.useState(false);

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img className="messageImg" src={photoURL || pict} onClick={() => setModalShow(true)} />
      <p className="messageText">{text}</p>   
      <MyVerticallyCenteredModal
          name = {displayName || "Anonym"}
          email = {email}
          photoURL = {photoURL || pict}
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </div>
  </>)
}


export default App;
