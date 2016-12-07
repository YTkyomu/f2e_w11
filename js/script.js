$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB69DixnpQJN6ZOxOSPCq4nu8Mxf9l3suM",
    authDomain: "f2e-wk12.firebaseapp.com",
    databaseURL: "https://f2e-wk12.firebaseio.com",
    storageBucket: "f2e-wk12.appspot.com",
    messagingSenderId: "972458047926"
  };
  firebase.initializeApp(config);

  // Firebase database reference
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');
  var dbRef = firebase.database().ref();

  var photoURL;
  var $img = $('img');

  // REGISTER DOM ELEMENTS
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');

  const $hovershadow = $('.hover-shadow');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');
  const $occupation_in = $('#occupation_in');
  const $age_in = $('#age_in');
  const $descriptions_in = $('#descriptions_in');
  const $file = $('#file');

  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileOcc = $('#profile-occ');
  const $profileAge = $('#profile-age');
  const $profileDes = $('#profile-des');

  var $messageField = $('#messageInput');
  var $nameField = $('#nameInput');
  var $messageList = $('#example-messages2');

  // Hovershadow
  $hovershadow.hover(
    function(){
      $(this).addClass("mdl-shadow--4dp");
    },
    function(){
      $(this).removeClass("mdl-shadow--4dp");
    }
  );

  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function() {
    $file.change(handleFileSelect);
    // $file.disabled = false;
  };

  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignUp.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled')
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
  }

  // Sign In
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log('SignIn User');
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user is "+user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.push({email:user.email});
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    var use = firebase.auth().currentUser;
    if(user) {
      console.log(user);
      const loginName = user.displayName || user.email;
      const dbUserid = dbUser.child(user.uid);
      var $occ = dbUserid.child('Occupation');
      var $age = dbUserid.child('Age');
      var $des = dbUserid.child('Descriptions');
      $signInfo.html(loginName+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      $img.attr("src",user.photoURL);
      $age.on('value', function(snap){
        $profileAge.html(snap.val());
      });
      $occ.on('value', function(snap){
        $profileOcc.html(snap.val());
      });
      $des.on('value', function(snap){
        $profileDes.html(snap.val());
      });
    } else {
      console.log("not logged in");
      $profileName.html("N/A");
      $profileEmail.html('N/A');
      $profileOcc.html('N/A');
      $profileAge.html('N/A');
      $profileDes.html('N/A');
      $img.attr("src","");
    }
  });

  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
    $messageList.empty();
    location.reload();
  });

  // Submit
  $btnSubmit.click(function(){
    var user = firebase.auth().currentUser;
    const $userName = $('#userName').val();
    const dbUserid = dbUser.child(user.uid);
    var occ = $occupation_in.val();
    var age = $age_in.val();
    var des = $descriptions_in.val();
    dbUserid.set({Age:age,Occupation:occ,Descriptions:des});
    var $occ = dbUserid.child('Occupation');
    var $age = dbUserid.child('Age');
    var $des = dbUserid.child('Descriptions');
    $age.on('value', function(snap){
      $profileAge.html(snap.val());
    });
    $occ.on('value', function(snap){
      $profileOcc.html(snap.val());
    });
    $des.on('value', function(snap){
      $profileDes.html(snap.val());
    });
    const promise = user.updateProfile({
      displayName: $userName,
      photoURL: photoURL
    });
    promise.then(function() {
      console.log("Update successful.");
      user = firebase.auth().currentUser;
      if (user) {
        $profileName.html(user.displayName);
        $profileEmail.html(user.email);
        $img.attr("src",user.photoURL);
        const loginName = user.displayName || user.email;
        $signInfo.html(loginName+" is login...");
        location.reload();
      }
    });
  });
  //chatroom
  // REGISTER DOM ELEMENTS

  // LISTEN FOR KEYPRESS EVENT
  firebase.auth().onAuthStateChanged(function(user){
    if(user){
      var use = firebase.auth().currentUser;
      const dbUserid = dbUser.child(user.uid);
      $messageField.keypress(function (e) {
        if (e.keyCode == 13) {
          var use = firebase.auth().currentUser;
          //FIELD VALUES
          var username = $nameField.val();
          var message = $messageField.val();
          var picture = use.photoURL;
          console.log(username);
          console.log(message);
          //SAVE DATA TO FIREBASE AND EMPTY FIELD
          dbRef.push({name:username, text:message, pic:picture});
          $messageField.val('');
        }
      });
      // Add a callback that is triggered for each chat message.
      dbRef.limitToLast(10).on('child_added', function (snapshot) {
        var use = firebase.auth().currentUser;
        //GET DATA
        var data = snapshot.val();
        var username = data.name || "anonymous";
        var message = data.text;
        var pic = data.pic;
        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        var $messageElement = $("<li>");
        var $nameElement = $("<strong class='example-chat-username'></strong>");
        //console.log("888");
        if(message != ""){
          $nameElement.text(username);//.prepend($('<img>',{class:'chatimg',src:data.pic}));
          $messageElement.text(message).prepend($nameElement);
        //ADD MESSAGE
          $messageList.append($messageElement);
        }
        //SCROLL TO BOTTOM OF MESSAGE LIST
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });
    }
  });
});
