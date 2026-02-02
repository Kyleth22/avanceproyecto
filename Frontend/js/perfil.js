// --- 1. SINCRONIZACIÓN GLOBAL ---
// Si cierras sesión en otra pestaña (ej. el Index), esta pestaña te sacará automáticamente
window.addEventListener('storage', (event) => {
    if (event.key === 'token' && !event.newValue) {
        window.location.href = "login.html";
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // Si no hay token, ni siquiera intentamos cargar la página
    if (!token) {
        window.location.href = "login.html";
        return; // Detener ejecución
    }

    const inputUser = document.getElementById('perf-usuario');
    const inputEmail = document.getElementById('perf-correo');
    const inputDir = document.getElementById('perf-direccion');
    const btnEdit = document.getElementById('btn-edit-toggle');
    const btnLogout = document.getElementById('btn-logout'); // El botón de tu HTML

    // --- 2. LÓGICA DE CERRAR SESIÓN ---
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            alert("Sesión cerrada.");
            window.location.href = "index.html";
        });
    }

    // --- 3. CARGAR DATOS AL INICIO ---
    try {
        const res = await fetch('http://localhost:3000/api/perfil', {
            headers: { 'Authorization': token }
        });
        
        // Si el token es inválido o expiró (el servidor devuelve 401 o 403)
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = "login.html";
            return;
        }

        const data = await res.json();
        inputUser.value = data.nombre_usuario;
        inputEmail.value = data.email;
        inputDir.value = data.direccion || "";
    } catch (err) { 
        console.error("Error cargando perfil", err); 
    }

    // --- 4. LÓGICA DE EDICIÓN ---
    let editMode = false;
    btnEdit.addEventListener('click', async () => {
        editMode = !editMode;
        if (editMode) {
            inputUser.disabled = false;
            inputDir.disabled = false;
            btnEdit.textContent = "Guardar cambios";
            btnEdit.style.backgroundColor = "var(--color-acento)";
            btnEdit.style.color = "#1e1e1e";
        } else {
            const res = await fetch('http://localhost:3000/api/perfil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ nombre: inputUser.value, direccion: inputDir.value })
            });
            
            if (res.ok) {
                alert("Información actualizada");
                const userLocal = JSON.parse(localStorage.getItem('usuario'));
                userLocal.nombre = inputUser.value;
                localStorage.setItem('usuario', JSON.stringify(userLocal));
            }
            
            inputUser.disabled = true;
            inputDir.disabled = true;
            btnEdit.textContent = "Editar información";
            btnEdit.style.backgroundColor = "transparent";
            btnEdit.style.color = "var(--color-acento)";
        }
    });
});