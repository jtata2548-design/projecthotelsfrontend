const imageViewer = document.querySelector('.image-viewer');

if (imageViewer) {
	const viewerImage = imageViewer.querySelector('.image-viewer-image');
	const viewerCaption = imageViewer.querySelector('.image-viewer-caption');
	const closeButton = imageViewer.querySelector('.image-viewer-close');

	document.querySelectorAll('.gallery-photo, .service-image-link').forEach((photo) => {
		photo.addEventListener('click', (event) => {
			event.preventDefault();
			const thumbnail = photo.querySelector('img');
			const title = photo.closest('.service-card')?.querySelector('h2')
				|| photo.querySelector('h3');

			viewerImage.src = photo.href;
			viewerImage.alt = thumbnail.alt;
			viewerCaption.textContent = title?.textContent || thumbnail.alt;
			imageViewer.showModal();
			closeButton.focus();
		});
	});

	closeButton.addEventListener('click', () => imageViewer.close());

	imageViewer.addEventListener('click', (event) => {
		if (event.target === imageViewer) {
			imageViewer.close();
		}
	});
}

const arrivalInput = document.querySelector('#checkin');
const departureInput = document.querySelector('#checkout');
const roomSelect = document.querySelector('#room');
const bookingStatus = document.querySelector('#booking-status');
const confirmationForm = document.querySelector('#booking-confirmation');
const whatsappLink = document.querySelector('#booking-whatsapp-link');
const emailLink = document.querySelector('#booking-email-link');

if (arrivalInput && departureInput) {
	const today = new Date();
	const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 10);

	arrivalInput.min = localToday;
	departureInput.min = localToday;

	arrivalInput.addEventListener('change', () => {
		departureInput.min = arrivalInput.value || localToday;
		if (departureInput.value && departureInput.value <= arrivalInput.value) {
			departureInput.value = '';
		}
		departureInput.setCustomValidity('');
	});

	departureInput.addEventListener('input', () => departureInput.setCustomValidity(''));
}

function verifierDisponibilite() {
	if (!arrivalInput || !departureInput || !bookingStatus) return;

	if (!arrivalInput.value) {
		arrivalInput.reportValidity();
		return;
	}
	if (!departureInput.value) {
		departureInput.reportValidity();
		return;
	}
	if (departureInput.value <= arrivalInput.value) {
		departureInput.setCustomValidity('La date de départ doit être après la date d’arrivée.');
		departureInput.reportValidity();
		return;
	}
	if (roomSelect && !roomSelect.value) {
		roomSelect.reportValidity();
		return;
	}

	if (confirmationForm) {
		confirmationForm.hidden = false;
		bookingStatus.textContent = 'Dates et chambre sélectionnées. Complétez vos coordonnées pour préparer la demande à l’accueil.';
		confirmationForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
		confirmationForm.querySelector('#guest-name')?.focus({ preventScroll: true });
	}
}

function reserver(roomName) {
	if (!bookingStatus || !arrivalInput) return;

	if (roomSelect) roomSelect.value = roomName;
	bookingStatus.textContent = `${roomName} sélectionnée. Choisissez vos dates puis continuez pour confirmer la demande.`;
	document.querySelector('.search-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	arrivalInput.focus({ preventScroll: true });
}

if (confirmationForm && whatsappLink && emailLink) {
	confirmationForm.addEventListener('submit', (event) => {
		event.preventDefault();
		if (!confirmationForm.reportValidity()) return;

		const guestName = confirmationForm.querySelector('#guest-name').value.trim();
		const guestPhone = confirmationForm.querySelector('#guest-phone').value.trim();
		const guestCount = document.querySelector('#guests')?.selectedOptions[0]?.textContent;
		const formatDate = (value) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })
			.format(new Date(`${value}T00:00:00`));
		const message = [
			'Bonjour, je souhaite envoyer une demande de réservation à l’accueil.',
			`Nom : ${guestName}`,
			`Téléphone : ${guestPhone}`,
			`Chambre : ${roomSelect?.selectedOptions[0]?.textContent || 'Non précisée'}`,
			`Arrivée : ${formatDate(arrivalInput.value)}`,
			`Départ : ${formatDate(departureInput.value)}`,
			`Voyageurs : ${guestCount || 'Non précisé'}`
		].join('\n');

		const encodedMessage = encodeURIComponent(message);
		whatsappLink.href = `https://wa.me/243973318852?text=${encodedMessage}`;
		emailLink.href = `mailto:juniortata2548@gmail.com?subject=${encodeURIComponent('Demande de réservation - Le Grand Horizon')}&body=${encodedMessage}`;
		whatsappLink.hidden = false;
		emailLink.hidden = false;
		bookingStatus.textContent = 'Votre demande est prête. WhatsApp va s’ouvrir; appuyez sur « Envoyer » dans WhatsApp pour la transmettre à l’accueil. Le lien e-mail reste disponible si WhatsApp ne s’ouvre pas.';
		window.open(whatsappLink.href, '_blank', 'noopener,noreferrer');
		whatsappLink.focus();
	});
}

