import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyArWT1QVnXjTpdjlAiku0N6dSuHw8UdkKY",
    authDomain: "miapppersonal-5068d.firebaseapp.com",
    projectId: "miapppersonal-5068d",
    storageBucket: "miapppersonal-5068d.firebasestorage.app",
    messagingSenderId: "757662369096",
    appId: "1:757662369096:web:fe82ef0584eba8ed029f7d"
};

const app = initializeApp(firebaseConfig);

export { app };
