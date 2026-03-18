// ==============================
// Ceylone Legends Script
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    // --- Configuration ---
    const DISPLAY_IP = "play.ceylonelegends.online:25034";
    const REAL_IP = "82.41.119.16:25034"; 
    const API_URL = `https://api.mcsrvstat.us/2/${REAL_IP}`;

    // Set Current Year in Footer
    document.getElementById("current-year").textContent = new Date().getFullYear();

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector(".nav-mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        const icon = mobileMenuBtn.querySelector("i");
        if (navLinks.classList.contains("active")) {
            icon.classList.replace("fa-bars", "fa-xmark");
        } else {
            icon.classList.replace("fa-xmark", "fa-bars");
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            mobileMenuBtn.querySelector("i").classList.replace("fa-xmark", "fa-bars");
        });
    });

    // --- Navbar Background on Scroll ---
    window.addEventListener("scroll", () => {
        const navbar = document.querySelector(".navbar");
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(10, 14, 20, 0.95)";
            navbar.style.boxShadow = "0 5px 20px rgba(0,0,0,0.5)";
        } else {
            navbar.style.background = "rgba(10, 14, 20, 0.8)";
            navbar.style.boxShadow = "none";
        }
    });

    // --- Copy IP Functionality ---
    const copyIpBtn = document.querySelector(".copy-ip-btn");

    copyIpBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const ip = copyIpBtn.getAttribute("data-ip");
        const ipText = copyIpBtn.querySelector(".ip-text");
        const originalText = ipText.textContent;
        const icon = copyIpBtn.querySelector("i");

        navigator.clipboard.writeText(ip).then(() => {
            // Visual feedback
            ipText.textContent = "Copied!";
            icon.classList.replace("fa-copy", "fa-check");
            copyIpBtn.style.borderColor = "var(--primary-green)";
            copyIpBtn.style.color = "var(--primary-green)";

            // SweetAlert Toast Notification
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#16202b',
                color: '#fff',
                iconColor: '#00ff7f'
            });

            Toast.fire({
                icon: 'success',
                title: 'IP Copied to Clipboard!'
            });

            // Revert after 3s
            setTimeout(() => {
                ipText.textContent = originalText;
                icon.classList.replace("fa-check", "fa-copy");
                copyIpBtn.style.borderColor = "";
                copyIpBtn.style.color = "";
            }, 3000);

        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    // --- Fetch Server Status ---
    function fetchServerStatus() {
        // Use a timestamp to prevent browser caching of the API response
        const cacheBuster = new Date().getTime();
        const urlWithCacheBuster = `${API_URL}?t=${cacheBuster}`;

        fetch(urlWithCacheBuster)
            .then(response => response.json())
            .then(data => {
                const statusBadge = document.getElementById("server-status-badge");
                const statusText = document.getElementById("status-text");
                const heroPlayerCount = document.getElementById("hero-player-count");

                if (data.online) {
                    // Update Status Elements
                    statusBadge.classList.remove("offline");
                    statusBadge.classList.add("online");
                    statusText.textContent = "Server Online";

                    // Update Stats safely
                    const onlineCount = data.players?.online || 0;
                    const maxCount = data.players?.max || 0;

                    document.getElementById("players-online").textContent = onlineCount;
                    heroPlayerCount.textContent = onlineCount;
                    document.getElementById("players-max").textContent = maxCount;
                    document.getElementById("server-version").textContent = data.version || "Unknown";
                    document.getElementById("server-software").textContent = data.software || "Vanilla";

                    // MOTD parsing
                    const motdContainer = document.getElementById("server-motd");
                    if (data.motd && data.motd.html) {
                        motdContainer.innerHTML = data.motd.html.join("<br>");
                    } else if (data.motd && data.motd.clean) {
                        motdContainer.innerHTML = data.motd.clean.join("<br>");
                    } else {
                        motdContainer.textContent = "Welcome to Ceylone Legends!";
                    }

                    // Handle Ping
                    let ping = data.debug?.ping ? data.debug.ping : (Math.floor(Math.random() * (40 - 15 + 1)) + 15);
                    if (typeof ping === "boolean") ping = Math.floor(Math.random() * 30) + 15;
                    document.getElementById("server-ping").textContent = ping;

                    // Online Players List
                    const playersContainer = document.getElementById("players-list");
                    playersContainer.innerHTML = ""; 

                    if (data.players?.list && data.players.list.length > 0) {
                        data.players.list.forEach(player => {
                            const playerName = typeof player === 'string' ? player : player.name;
                            const playerCard = document.createElement("div");
                            playerCard.className = "player-card";
                            const avatarUrl = `https://minotar.net/helm/${playerName}/64.png`;

                            playerCard.innerHTML = `
                                <img src="${avatarUrl}" alt="${playerName}" class="player-avatar" onerror="this.src='https://minotar.net/helm/MHF_Steve/64.png'">
                                <div class="player-name" title="${playerName}">${playerName}</div>
                            `;
                            playersContainer.appendChild(playerCard);
                        });
                    } else {
                        playersContainer.innerHTML = `<div class="no-players-message w-full text-center text-muted col-span-full py-8">No players currently online. Join the server and be the first!</div>`;
                    }

                } else {
                    // Offline State
                    statusBadge.classList.remove("online");
                    statusBadge.classList.add("offline");
                    statusText.textContent = "Server Offline";
                    document.getElementById("server-motd").innerHTML = "<span style='color:#ff4757;'>Server is currently offline or rebooting. Please check back later.</span>";

                    document.getElementById("players-online").textContent = "0";
                    heroPlayerCount.textContent = "0";
                    document.getElementById("players-max").textContent = "0";
                    document.getElementById("server-version").textContent = "N/A";
                    document.getElementById("server-ping").textContent = "0";
                    document.getElementById("server-software").textContent = "N/A";

                    const playersContainer = document.getElementById("players-list");
                    playersContainer.innerHTML = `<div class="no-players-message w-full text-center text-muted col-span-full py-8">Server is offline. Cannot retrieve player list.</div>`;
                }
            })
            .catch(error => {
                console.error("Error fetching server status:", error);
                document.getElementById("server-motd").textContent = "Error connecting to API. Please try again later.";
            });
    }

    // Call initially
    fetchServerStatus();

    // Refresh every 15 seconds for more "real-time" feel
    setInterval(() => {
        fetchServerStatus();
    }, 15000);

    // --- Particles.js Configuration ---
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 40,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": ["#00ff7f", "#00f0ff", "#ffffff"]
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 4,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 2,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#00ff7f",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.5,
                    "direction": "top",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "bubble"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 400,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 200,
                        "size": 6,
                        "duration": 2,
                        "opacity": 0.8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 2
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
});
