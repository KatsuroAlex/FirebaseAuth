/// временные ключи с тестового профиля, можно заменить на аналогичные при смене проекта и для тестирования на своем проекте firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhqbtzAwglSIeQhTjwevKi6nDNuNAs9Nw",
  authDomain: "fir-auth-form-f349a.firebaseapp.com",
  projectId: "fir-auth-form-f349a",
  storageBucket: "fir-auth-form-f349a.appspot.com",
  messagingSenderId: "72494848872",
  appId: "1:72494848872:web:d733c6efffe577c73194dd"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

window.onload = function() {
  const logoutButton = document.getElementById('logout_button');
  if (!auth.currentUser) {
    logoutButton.disabled = true; // Делаем кнопку неактивной при загрузке страницы, если пользователь не вошел в систему
  }
};

function redirectToLogin() {
  document.getElementById('reg_button-section').style.display = 'none';
  document.getElementById('login_button-section').style.display = 'block';
}

function redirectToReg() {
  document.getElementById('login_button-section').style.display = 'none';
  document.getElementById('reg_button-section').style.display = 'block';
}

// Функция регистрации пользователя
function register () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const full_name = document.getElementById('full_name').value;

  // Проверка на валидацию полей формы
  if (validate_email(email) == false || validate_password(password) == false) {
    alert('Вы не ввели пароль или почту!!');
    return
  }
  if (validate_field(full_name) == false) {
    alert('Вы не заполнили одно или несколько полей!!');
    return
  }
  
  // Используем встроенный метод firebase по созданию пользователя
  auth.createUserWithEmailAndPassword(email, password)
  .then(function() {
    const user = auth.currentUser;
    // Добавляем пользователя в базу данных firebase
    const database_ref = database.ref();
    // Формируем данные пользователя
    const user_data = {
      email : email, 
      full_name : full_name,
      last_login : Date.now()
    }
    // Отправляем данные пользователя в БД firebase в директорию users
    database_ref.child('users/' + user.uid).set(user_data);
    alert('Вы успешно зарегистрировались!!')
  })
  .catch(function(error) {
    const error_code = error.code;
    const error_message = error.message;
    if (error_code === 'auth/email-already-in-use') {
      alert('Пользователь с таким email уже зарегистрирован.');
    } else if (error_code === 'auth/weak-password') {
      alert('Пароль должен быть не менее 6 символов');
    } else {
      alert(error.message);
    }
  })
}

// Функция входа пользователя
function login () {
  if (auth.currentUser) {
    alert('Вы уже вошли в систему!')
    return;
  }
  // Получаем данные из инпутов
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  // Валидация полей инпутов
  if (validate_email(email) == false || validate_password(password) == false) {
    alert('Вы не заполнили почту или пароль!!')
    return 
  }

  auth.signInWithEmailAndPassword(email, password)
  .then(function() {
    const user = auth.currentUser
    // Добавляем пользователя в базу данных firebase
    const database_ref = database.ref()
    // Фиксируем время входа пользователя в аккаунт 
    const user_data = {
      last_login : Date.now()
    }
    // Загружаем данные пользователя в базу данных firebase
    database_ref.child('users/' + user.uid).update(user_data)
    alert('Вы вошли в аккаунт!!')
  }) 
    .catch(function(error) {
    const errorСode = error.code;
    console.log(errorСode)
    const errorMessage = error.message;
    console.log(errorMessage)
    if (errorСode === 'auth/internal-error') {
      alert('Неправильно введена почта или пароль.')
    } else {
      console.log(errorMessage)
    }
  })
}

// Функция для выхода из профиля
const logout = () => {
  auth.signOut()
    .then(() => {
        // Успешный выход из профиля
        console.log("Пользователь вышел из аккаунта");
        alert("Вы вышли из аккаунта!")
    })
    .catch((error) => {
        // Ошибка выхода из профиля
        console.error("Ошибка выхода:", error);
    });
};

// Устанавливаем слушатель изменения состояния аутентификации
auth.onAuthStateChanged((user) => {
  const logoutButtons = document.querySelectorAll('#logout_button');
  logoutButtons.forEach(button => {
    if (user) {
      // Пользователь вошел в систему
      button.disabled = false;
      console.log("Пользователь зашел в аккаунт");
    } else {
      // Пользователь вышел из системы
      button.disabled = true;
      console.log("Пользователь вышел из аккаунта");
    }
  })
});

/// ВАЛИДАЦИЯ
function validate_email(email) {
  // стандартная проверка email
  expression = /^[^@]+@\w+(\.\w+)+\w$/
  if (expression.test(email) == true) {
    return true
  } else {
    return false
  }
}

function validate_password(password) {
  // Делаем проверку на количество символов в пароле (требования firebase)
  if (password < 6) {
    return false
  } else {
    return true
  }
}

/// Простая валидация на заполнение полей
function validate_field(field) {
  if (field == null) {
    return false
  }
  if (field.length <= 0) {
    return false
  } else {
    return true
  }
}