let form = document.getElementById("sendmail");

form.addEventListener('submit', (event) => {
    event.preventDefault();
});

function sendMail() {
    let name = form.elements[0];
    let email = form.elements[1];
    let msg = form.elements[2];
	Email.send({
		Host: "smtp.gmail.com",
		Username: "hello.tirth.jivani@gmail.com",
		Password: "Tirth#@!17",
		To: email.value + ",tirthjivani17@gmail.com",
		From: "hello.tirth.jivani@gmail.com",
		Subject: "Hello from " + name.value + ".",
		Body: msg.value,
    }).then(() => {
        name.value = "";
        msg.value = "";
        email.value = "";
        msgText = "Email Successfully sent!";
    })
}
