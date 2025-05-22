import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyALIQ_z2LGS9ZQxh_GvQRxewIDpsF2A53s',
  authDomain: 'eyeexpress-ca256.firebaseapp.com',
  projectId: 'eyeexpress-ca256',
  storageBucket: 'eyeexpress-ca256.appspot.com',
  messagingSenderId: '387622436973',
  appId: '1:387622436973:web:e01fa84e00536495b97f64',
  measurementId: 'G-Z8JM3DHXHJ',
};

export default firebase.initializeApp(firebaseConfig);
