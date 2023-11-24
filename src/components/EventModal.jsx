import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EventModal({ show, onClose, onDelete, onUpdate, id, calendarApiNew }) {
  const [eventData, setEventData] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchData = async () => {
    try {
      const response = await axios.post('http://localhost:5001/getData', { id });
      setEventData(response.data);
      setEventTitle(response.data.eventTitle);
  
      // Use o método `formatDate` para extrair a data e a hora separadamente
      const startDateTime = formatDate(response.data.startTime);
      const [startDate, startTime] = startDateTime.split('T');
      setStartDate(startDate);
      setStartTime(startTime);
  
      const endDateTime = formatDate(response.data.endTime);
      const [endDate, endTime] = endDateTime.split('T');
      setEndDate(endDate);
      setEndTime(endTime);
  
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao obter dados por ID:', error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    // Obtém as partes da data
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    // Obtém as partes da hora
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // Retorna a data e hora formatadas
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };  

  const updateEvent = async () => {
    const object = {
      id: id,
      eventTitle: eventTitle,
      startTime: `${startDate}T${startTime}:00.000Z`, // Adiciona os segundos e milissegundos
      endTime: `${endDate}T${endTime}:00.000Z` // Adiciona os segundos e milissegundos
    };
  
    try {
      const response = await axios.post(`http://localhost:5001/updateEvent`, object);
      console.log(response);
  
      // Atualiza o evento no calendário
      const calendarEvent = calendarApiNew.getEventById(id);
  
      if (calendarEvent) {
        calendarEvent.setProp('title', eventTitle);
        calendarEvent.setStart(`${startDate}T${startTime}`);
        calendarEvent.setEnd(`${endDate}T${endTime}`);
      }
  
      console.log('Evento foi atualizado com sucesso');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar o evento:', error);
    }
  };

  useEffect(() => {
    if (show) {
      fetchData();
    }
  }, [id, show]);

  const handleEventTitleChange = (e) => {
    setEventTitle(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  return (
    <div>
      <div className={`modal fade ${show ? "show" : ""}`} style={{ display: show ? "block" : "none" }} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Detalhes do Evento</h5>
              <button type="button" className="close" onClick={onClose} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {eventData ? (
                <>
                  <p>ID: {id}</p>
                  <div className="form-group mb-3">
                    <label className="form-label">Nome do evento:</label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={handleEventTitleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Data de Início:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      className="form-control"
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={handleStartTimeChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Data de Término:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      className="form-control"
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={handleEndTimeChange}
                      className="form-control"
                    />
                  </div>
                </>
              ) : (
                <p>Carregando dados...</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={updateEvent}>
                Atualizar
              </button>
              <button type="button" className="btn btn-danger" onClick={onDelete}>
                Apagar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventModal;