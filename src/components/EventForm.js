import React, { useState } from 'react';
import axios from 'axios';

const EventForm = ({ handleCloseNewModal }) => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessages, setErrorMessages] = useState({});

  const handleSaveEvent = () => {
    const errors = {};

    if (!startTime || !startDate) {
      errors.startTime = 'Preencha a data e a hora de início do evento.';
    }

    if (!eventTitle) {
      errors.eventTitle = 'Preencha o nome do evento.';
    }

    if (!endTime || !endDate) {
      errors.endTime = 'Preencha a data e a hora de término do evento.';
    }

    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
    } else {
      const newEvent = {
        startTime: `${startDate}T${startTime}:00`,
        endTime: `${endDate}T${endTime}:00`,
        eventTitle,
      };

      axios
        .post('http://localhost:5001/createEvent', newEvent)
        .then(response => {
          console.log('Evento criado com sucesso:', response.data);
          setSuccessMessage('Evento criado com sucesso!');
          handleCloseNewModal();
          setStartDate('');
          setStartTime('');
          setEndDate('');
          setEndTime('');
          setEventTitle('');
          setSuccessMessage('');
        })
        .catch(error => {
          handleCloseNewModal();
          console.error('Erro ao criar evento:', error);
          setSuccessMessage('');
          setErrorMessages({});
        });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-center">
      <div className="text-center py-4 event-form">
        <div className="form-group mb-3">
          <h2 className="display-10">Criar novo evento</h2>
          <label className="form-label">Data e hora de início do evento:</label>
          <div className="d-flex">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="form-control mr-2"
            />
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="form-control"
            />
          </div>
          {errorMessages.startTime && <div className="alert alert-danger">{errorMessages.startTime}</div>}
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Data e hora de término do evento:</label>
          <div className="d-flex">
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="form-control mr-2"
            />
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="form-control"
            />
          </div>
          {errorMessages.endTime && <div className="alert alert-danger">{errorMessages.endTime}</div>}
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Nome do evento:</label>
          <input
            type="text"
            value={eventTitle}
            onChange={e => setEventTitle(e.target.value)}
            className="form-control"
          />
          {errorMessages.eventTitle && <div className="alert alert-danger">{errorMessages.eventTitle}</div>}
        </div>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <button className="btn btn-primary mr-2" onClick={handleSaveEvent}>
          Salvar
        </button>
      </div>
    </div>
  );
};

export default EventForm;
