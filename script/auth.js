const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex=/^[A-Za-z ]+$/;
const passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!?])[A-Za-z\d@#$%^&*!?]{8,20}$/;

function showError(input,errorElement,message){
    input.classList.add("input-error");
    if(errorElement){
        errorElement.textContent=message;
    }
}

function clearError(input,errorElement){
    input.classList.remove("input-error");
    if(errorElement){
        errorElement.textContent="";
    }
}

function convertToBase64(file){
    return new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.readAsDataURL(file);
        reader.onload=()=>resolve(reader.result);
        reader.onerror=(error)=>reject(error);
    });
}

const registerForm=document.getElementById("registerForm");
const loginForm=document.getElementById("loginForm");

if(registerForm){

    registerForm.addEventListener("submit",async(event)=>{

        event.preventDefault();

        try{

            const name=document.getElementById("name").value.trim();
            const email=document.getElementById("email").value.trim().toLowerCase();
            const phone=document.getElementById("phone").value.trim();
            const age=document.getElementById("age").value;
            const color=document.getElementById("profileColor").value;
            const password=document.getElementById("password").value;
            const confirmPassword=document.getElementById("confirmPassword").value;

            const genderChecked=document.querySelector('input[name="gender"]:checked');
            const gender=genderChecked?genderChecked.value:"";

            const imageFile=document.getElementById("profileImage").files[0];

            const nameInput=document.getElementById("name");
            const emailInput=document.getElementById("email");
            const phoneInput=document.getElementById("phone");
            const passwordInput=document.getElementById("password");
            const confirmPasswordInput=document.getElementById("confirmPassword");

            const nameError=document.getElementById("nameError");
            const emailError=document.getElementById("emailError");
            const phoneError=document.getElementById("phoneError");
            const passwordError=document.getElementById("passwordError");
            const confirmPasswordError=document.getElementById("confirmPasswordError");
            const imageError=document.getElementById("imageError");
            const genderError=document.getElementById("genderError");

            let isValid=true;

            if(name.length<3){
                showError(nameInput,nameError,"Minimum 3 characters required");
                isValid=false;
            }else if(!nameRegex.test(name)){
                showError(nameInput,nameError,"Only alphabets and spaces allowed");
                isValid=false;
            }else{
                clearError(nameInput,nameError);
            }

            if(!emailRegex.test(email)){
                showError(emailInput,emailError,"Enter valid email address");
                isValid=false;
            }else{
                clearError(emailInput,emailError);
            }

            if(!/^[0-9]{10}$/.test(phone)){
                showError(phoneInput,phoneError,"Enter valid 10 digit phone number");
                isValid=false;
            }else{
                clearError(phoneInput,phoneError);
            }

            if(!passwordRegex.test(password)){
                showError(passwordInput,passwordError,"8-20 chars with upper, lower, number & special character");
                isValid=false;
            }else{
                clearError(passwordInput,passwordError);
            }

            if(password!==confirmPassword){
                showError(confirmPasswordInput,confirmPasswordError,"Passwords do not match");
                isValid=false;
            }else{
                clearError(confirmPasswordInput,confirmPasswordError);
            }

            if(!gender){
                genderError.textContent="Please select gender";
                isValid=false;
            }else{
                genderError.textContent="";
            }

            if(imageFile){

                const allowedTypes=[
                    "image/jpeg",
                    "image/jpg",
                    "image/png"
                ];

                if(!allowedTypes.includes(imageFile.type)){
                    imageError.textContent="Only JPG, JPEG and PNG allowed";
                    isValid=false;
                }else if(imageFile.size>2*1024*1024){
                    imageError.textContent="Maximum image size is 2MB";
                    isValid=false;
                }else{
                    imageError.textContent="";
                }

            }

            if(!isValid){
                return;
            }

            const submitBtn=registerForm.querySelector('button[type="submit"]');
            submitBtn.disabled=true;
            submitBtn.innerHTML="<span>Creating Account... ⏳</span>";

            const existingUser=await getUserByMail(email);

            if(existingUser){

                showError(emailInput,emailError,"Email already registered");

                submitBtn.disabled=false;
                submitBtn.innerHTML="<span>🚀 Create My Account</span>";

                return;
            }

            let profileImage="";

            if(imageFile){
                profileImage=await convertToBase64(imageFile);
            }

            const user={
                name,
                email,
                phone,
                age,
                color,
                gender,
                password,
                profileImage,
                savedJobs:[]
            };

            await addUser(user);

            showNotification("Registration Successful! Redirecting to login...","success");

            registerForm.reset();

            setTimeout(()=>{
                window.location.href="./login.html";
            },1500);

        }catch(error){

            console.error("Registration Failure Error:",error);

            showNotification("Registration failed. Please check network connection.","danger");

            const submitBtn=registerForm.querySelector('button[type="submit"]');

            if(submitBtn){
                submitBtn.disabled=false;
                submitBtn.innerHTML="<span>🚀 Create My Account</span>";
            }

        }

    });

}

if(loginForm){

    loginForm.addEventListener("submit",async(event)=>{

        event.preventDefault();

        try{

            const email=document.getElementById("email").value.trim().toLowerCase();
            const password=document.getElementById("password").value;

            const loginEmailError=document.getElementById("loginEmailError");
            const loginPasswordError=document.getElementById("loginPasswordError");

            let isValid=true;

            if(!emailRegex.test(email)){
                loginEmailError.textContent="Enter valid email address";
                isValid=false;
            }else{
                loginEmailError.textContent="";
            }

            if(password.trim()===""){
                loginPasswordError.textContent="Password required";
                isValid=false;
            }else{
                loginPasswordError.textContent="";
            }

            if(!isValid){
                return;
            }

            const loginBtn=document.getElementById("loginBtn");
            loginBtn.disabled=true;
            loginBtn.innerHTML="<span>Logging in... ⏳</span>";

            const user=await getUserByMail(email);

            if(!user){

                showNotification("Account email not found!","danger");

                loginBtn.disabled=false;
                loginBtn.innerHTML="<span>Login 🔑</span>";

                return;
            }

            if(user.password!==password){

                showNotification("Incorrect password. Please try again!","danger");

                loginBtn.disabled=false;
                loginBtn.innerHTML="<span>Login 🔑</span>";

                return;
            }

            sessionStorage.setItem("currentUser",JSON.stringify(user));

            showNotification("Login Successful! Preparing dashboard...","success");

            setTimeout(()=>{
                window.location.href="./dashboard.html";
            },1200);

        }catch(error){

            console.error("Login System Error:",error);

            showNotification("Login failed. Check server status.","danger");

            const loginBtn=document.getElementById("loginBtn");

            if(loginBtn){
                loginBtn.disabled=false;
                loginBtn.innerHTML="<span>Login 🔑</span>";
            }

        }

    });

}

function logout(){
    sessionStorage.removeItem("currentUser");
    window.location.href="./login.html";
}

function getCurrentUser(){
    const user=sessionStorage.getItem("currentUser");
    return user?JSON.parse(user):null;
}