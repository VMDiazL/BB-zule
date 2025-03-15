document.addEventListener("DOMContentLoaded", function () {
    // Calculadora (sin cambios)
    const calculadoraForm = document.getElementById("calculadora-form");
    if (calculadoraForm) {
        calculadoraForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const peso = parseFloat(document.getElementById("peso").value);
            if (isNaN(peso) || peso <= 0) {
                document.getElementById("resultado").innerText = "Por favor, ingresa un peso válido.";
                return;
            }
            const dosis = peso * 0.1;
            document.getElementById("resultado").innerText = `Dosis recomendada: ${dosis.toFixed(2)} mg`;
        });
    }

    // Cuestionario (sin cambios)
    const quizForm = document.getElementById("quiz-form");
    const preguntasContainer = document.getElementById("preguntas-container");
    const modalResultados = document.getElementById("modal-resultados");
    const cerrarModalBtn = document.getElementById("cerrar-modal");
    const reiniciarBtn = document.getElementById("reiniciar-cuestionario");

    if (quizForm && preguntasContainer && modalResultados && cerrarModalBtn && reiniciarBtn) {
        let preguntas = [];
        let preguntasSeleccionadas = [];

        fetch("questions.json")
            .then((response) => response.json())
            .then((data) => {
                preguntas = data;
                mostrarPreguntasAleatorias();
            })
            .catch((error) => {
                console.error("Error al cargar las preguntas:", error);
                preguntasContainer.innerHTML = "<p>Error al cargar las preguntas.</p>";
            });

        function seleccionarPreguntasAleatorias() {
            const shuffled = [...preguntas].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 10);
        }

        function mostrarPreguntasAleatorias() {
            preguntasSeleccionadas = seleccionarPreguntasAleatorias();
            preguntasContainer.innerHTML = "";
            preguntasSeleccionadas.forEach((pregunta, index) => {
                const preguntaDiv = document.createElement("div");
                preguntaDiv.className = "pregunta";
                preguntaDiv.innerHTML = `
                    <h3>${index + 1}. ${pregunta.text}</h3>
                    ${pregunta.options.map((opcion) => `
                        <div class="opcion">
                            <label>
                                <input type="radio" name="pregunta-${index}" value="${opcion.value}">
                                ${opcion.text}
                            </label>
                            <span class="feedback"></span>
                        </div>
                    `).join("")}
                `;
                preguntasContainer.appendChild(preguntaDiv);
            });
        }

        quizForm.addEventListener("submit", function (e) {
            e.preventDefault();
            console.log("Formulario enviado");
            const respuestasUsuario = {};
            let correctas = 0;

            preguntasSeleccionadas.forEach((pregunta, index) => {
                const respuesta = document.querySelector(`input[name="pregunta-${index}"]:checked`);
                respuestasUsuario[`pregunta-${index}`] = respuesta ? respuesta.value : null;

                const preguntaDiv = preguntasContainer.children[index];
                const opciones = preguntaDiv.querySelectorAll(".opcion");
                opciones.forEach((opcion) => {
                    const input = opcion.querySelector("input");
                    const feedback = opcion.querySelector(".feedback");
                    if (input.value === pregunta.correct) {
                        opcion.style.backgroundColor = "#e8f5e9";
                        feedback.textContent = "Respuesta correcta";
                        feedback.style.color = "green";
                        if (respuestasUsuario[`pregunta-${index}`] === pregunta.correct) {
                            correctas++;
                        }
                    } else if (respuestasUsuario[`pregunta-${index}`] === input.value) {
                        opcion.style.backgroundColor = "#ffebee";
                        feedback.textContent = "Respuesta incorrecta";
                        feedback.style.color = "red";
                    } else {
                        opcion.style.backgroundColor = "transparent";
                        feedback.textContent = "";
                    }
                });
            });

            console.log("Mostrando resultados");
            const detalleResultados = document.getElementById("detalle-resultados");
            detalleResultados.innerHTML = "";
            preguntasSeleccionadas.forEach((pregunta, index) => {
                const respuesta = respuestasUsuario[`pregunta-${index}`];
                const esCorrecta = respuesta === pregunta.correct;
                const estado = respuesta ? (esCorrecta ? "Correcta" : "Incorrecta") : "No respondida";
                detalleResultados.innerHTML += `
                    <p>${index + 1}. ${pregunta.text}: 
                        <span style="color: ${esCorrecta ? "green" : respuesta ? "red" : "gray"};">
                            ${estado}
                        </span>
                    </p>
                `;
            });

            document.getElementById("correctas").textContent = correctas;
            document.getElementById("total-preguntas").textContent = preguntasSeleccionadas.length;
            document.getElementById("puntaje").textContent = ((correctas / preguntasSeleccionadas.length) * 100).toFixed(2);
            modalResultados.classList.remove("hidden");
            console.log("Modal debería estar visible");
        });

        cerrarModalBtn.addEventListener("click", function () {
            modalResultados.classList.add("hidden");
        });

        reiniciarBtn.addEventListener("click", function () {
            modalResultados.classList.add("hidden");
            mostrarPreguntasAleatorias();
        });
    }

    // Foro de discusión (sin cambios)
    const foroForm = document.getElementById("foro-form");
    const listaTemas = document.getElementById("lista-temas");
    if (foroForm && listaTemas) {
        cargarTemas();
        foroForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const pregunta = document.getElementById("pregunta").value.trim();
            if (pregunta) {
                const nuevoTema = { id: Date.now(), pregunta: pregunta, respuestas: [] };
                guardarTema(nuevoTema);
                document.getElementById("pregunta").value = "";
                cargarTemas();
            } else {
                alert("Por favor, escribe una pregunta.");
            }
        });

        function guardarTema(tema) {
            const temas = JSON.parse(localStorage.getItem("temas")) || [];
            temas.push(tema);
            localStorage.setItem("temas", JSON.stringify(temas));
        }

        function cargarTemas() {
            const temas = JSON.parse(localStorage.getItem("temas")) || [];
            listaTemas.innerHTML = "";
            if (temas.length === 0) {
                listaTemas.innerHTML = "<p>No hay temas publicados aún.</p>";
            } else {
                temas.forEach((tema) => {
                    const temaDiv = document.createElement("div");
                    temaDiv.className = "tema";
                    temaDiv.innerHTML = `
                        <h3>${tema.pregunta}</h3>
                        <div class="respuestas">
                            ${tema.respuestas.length > 0 ? tema.respuestas.map(r => `<p>${r}</p>`).join("") : "<p>Sin respuestas aún.</p>"}
                        </div>
                        <form class="respuesta-form" data-id="${tema.id}">
                            <textarea placeholder="Escribe tu respuesta..." required></textarea>
                            <button type="submit">Responder</button>
                        </form>
                    `;
                    listaTemas.appendChild(temaDiv);
                });

                document.querySelectorAll(".respuesta-form").forEach((form) => {
                    form.addEventListener("submit", function (e) {
                        e.preventDefault();
                        const respuesta = form.querySelector("textarea").value.trim();
                        const temaId = parseInt(form.getAttribute("data-id"));
                        if (respuesta) {
                            agregarRespuesta(temaId, respuesta);
                            cargarTemas();
                        } else {
                            alert("Por favor, escribe una respuesta.");
                        }
                    });
                });
            }
        }

        function agregarRespuesta(temaId, respuesta) {
            const temas = JSON.parse(localStorage.getItem("temas")) || [];
            const tema = temas.find((t) => t.id === temaId);
            if (tema) {
                tema.respuestas.push(respuesta);
                localStorage.setItem("temas", JSON.stringify(temas));
            }
        }
    }

    // Galería de imágenes
    const galeriaItems = document.querySelectorAll(".galeria-item");
    const modalImagen = document.getElementById("modal-imagen");
    const imagenAmpliada = document.getElementById("imagen-ampliada");
    const cerrarModalImagen = document.getElementById("cerrar-modal-imagen");

    console.log("Galeria Items encontrados:", galeriaItems.length);
    console.log("Modal Imagen:", modalImagen);
    console.log("Imagen Ampliada:", imagenAmpliada);
    console.log("Cerrar Modal Imagen:", cerrarModalImagen);

    if (galeriaItems.length > 0 && modalImagen && imagenAmpliada && cerrarModalImagen) {
        galeriaItems.forEach((item) => {
            item.addEventListener("click", function () {
                console.log("Clic en imagen detectado");
                const imgSrc = this.querySelector("img").src;
                imagenAmpliada.src = imgSrc;
                modalImagen.classList.remove("hidden");
                console.log("Modal debería estar visible");
                imagenAmpliada.onload = function () {
                    imagenAmpliada.style.width = `${this.naturalWidth}px`;
                    imagenAmpliada.style.height = `${this.naturalHeight}px`;
                    console.log(`Tamaño original aplicado: ${this.naturalWidth}x${this.naturalHeight}`);
                };
            });
        });

        cerrarModalImagen.addEventListener("click", function () {
            console.log("Cerrar modal clic detectado");
            modalImagen.classList.add("hidden");
        });

        modalImagen.addEventListener("click", function (e) {
            if (e.target === modalImagen) {
                console.log("Clic fuera del modal detectado");
                modalImagen.classList.add("hidden");
            }
        });
    } else {
        console.error("Uno o más elementos de la galería no se encontraron");
    }
});
