const BASE_URL="http://localhost:3000";

async function apiRequest(endpoint,options={}){

    const url=`${BASE_URL}/${endpoint}`;

    if(options.body&&typeof options.body==="object"){

        options.headers={
            "Content-Type":"application/json",
            ...options.headers
        };

        options.body=JSON.stringify(options.body);

    }

    try{

        const response=await fetch(url,options);

        if(!response.ok){

            const errorMsg=`API Error: ${response.status} ${response.statusText} on ${endpoint}`;

            console.error(errorMsg);

            throw new Error(errorMsg);

        }

        if(options.method==="DELETE"){
            return {success:true};
        }

        return await response.json();

    }catch(error){

        console.error(`Fetch failure on endpoint [${endpoint}]:`,error);

        showNotification("Network Error: Make sure your JSON server is running!","danger");

        throw error;

    }

}

function showNotification(message,type="success"){

    let container=document.getElementById("toastContainer");

    if(!container){

        container=document.createElement("div");
        container.id="toastContainer";

        container.style.position="fixed";
        container.style.bottom="24px";
        container.style.right="24px";
        container.style.zIndex="9999";
        container.style.display="flex";
        container.style.flexDirection="column";
        container.style.gap="10px";

        document.body.appendChild(container);

    }

    const toast=document.createElement("div");

    toast.className="toast-notification show glass-panel";

    toast.style.display="flex";
    toast.style.alignItems="center";
    toast.style.gap="12px";
    toast.style.padding="16px 24px";
    toast.style.borderRadius="12px";
    toast.style.boxShadow="var(--shadow-lg)";
    toast.style.transform="translateY(0)";
    toast.style.opacity="1";
    toast.style.borderLeft=`5px solid var(--${type})`;

    const emojiMap={
        success:"🟢",
        warning:"🟡",
        danger:"🔴",
        info:"🔵"
    };

    toast.innerHTML=`
        <span style="font-size:18px;">${emojiMap[type]||"🔔"}</span>
        <span style="font-weight:500;font-size:14px;color:var(--text);">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(()=>{

        toast.style.transition="transform 0.3s ease,opacity 0.3s ease";
        toast.style.transform="translateY(20px)";
        toast.style.opacity="0";

        setTimeout(()=>{
            toast.remove();
        },300);

    },3500);

}

async function getUsers(){
    return await apiRequest("users");
}

async function addUser(user){

    const userPayload={
        ...user,
        email:user.email.trim().toLowerCase(),
        savedJobs:user.savedJobs||[]
    };

    return await apiRequest("users",{
        method:"POST",
        body:userPayload
    });

}

async function updateUser(id,user){

    return await apiRequest(`users/${id}`,{
        method:"PUT",
        body:user
    });

}

async function getUserByMail(email){

    const users=await apiRequest(
        `users?email=${email.trim().toLowerCase()}`
    );

    return users.length>0?users[0]:null;

}

async function getJobs(){
    return await apiRequest("jobs");
}

async function addJob(job){

    return await apiRequest("jobs",{
        method:"POST",
        body:job
    });

}

async function deleteJob(id){

    return await apiRequest(`jobs/${id}`,{
        method:"DELETE"
    });

}

async function updateJob(id,job){

    return await apiRequest(`jobs/${id}`,{
        method:"PUT",
        body:job
    });

}

async function getApplications(){
    return await apiRequest("applications");
}

async function addApplication(application){

    return await apiRequest("applications",{
        method:"POST",
        body:application
    });

}

async function updateApplication(id,application){

    return await apiRequest(`applications/${id}`,{
        method:"PUT",
        body:application
    });

}