import React, { useState, useRef, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import axios from "axios";
import CustomModal from "./CustomModal";
import EventModal from "./EventModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import pt from "date-fns/locale/pt-BR"; // Importe o idioma português
//import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

function Calendar() {
  const calendarRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]); // Lista local de eventos
  const [currentDate, setCurrentDate] = useState(new Date());
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const [formDate, setFormDate] = useState(new Date());

  const calendarApiNew = calendarRef.current ? calendarRef.current.getApi() : null;

  const handleMiniCalendarDateChange = (date) => {
    setFormDate(date);
    setCurrentDate(date);

    // Abre a visualização do dia no calendário principal
    if (calendarApiNew) {
      calendarApiNew.gotoDate(date);
      calendarApiNew.changeView("timeGridDay"); // Altere para a visualização desejada
    }
  };

  const handleAddEventClick = () => {
    setShowModal(true);
  };

  useEffect(() => {
    // Carrega os eventos ao montar o componente
    createEvent();
    checkAlerts(); // Verifica os alertas ao montar o componente
  }, []);

  useEffect(() => {
    // Verifica os alertas sempre que a lista de eventos for atualizada
    checkAlerts();
  }, [events]);

  const checkAlerts = () => {
    if (calendarApiNew) {
      const currentDate = calendarApiNew.getDate();
      const todayEvents = calendarApiNew.getEvents().filter((event) => {
        const eventDate = event.start;

        // Verifica se o evento ocorre hoje
        return (
          eventDate.getDate() === currentDate.getDate() &&
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear()
        );
      });

      // Exibe alertas para eventos que ocorrem hoje
      todayEvents.forEach((event) => {
        alert(`Hoje é o dia do evento: ${event.title}`);
      });
    }
  };

  const handleClose = () => setShowModal(false);

  const handleCloseNewModal = () => {
    setShowModal(false);
    createEvent();
  };

  async function getApi() {
    try {
      const response = await axios.get("http://localhost:5001/listEvents");
      if (response.status !== 200) {
        throw new Error(`Erro na solicitação: ${response.status} - ${response.statusText}`);
      }
  
      // Ajuste para converter as datas e horas para o fuso horário local no momento de exibição
      const events = response.data.map(event => ({
        ...event,
        start: utcToZonedTime(new Date(event.startTime), 'America/Sao_Paulo'),
        end: utcToZonedTime(new Date(event.endTime), 'America/Sao_Paulo'),
      }));
  
      return events;
    } catch (error) {
      console.error("Erro ao buscar dados na API:", error);
      throw error;
    }
  }
  
  async function createEvent() {
    try {
      const data = await getApi();
  
      const newEventArray = data.map((item) => ({
        id: item.id,
        title: item.eventTitle,
        start: new Date(item.startTime), 
        end: new Date(item.endTime), 
      }));
  
      setEvents(newEventArray); // Atualiza a lista local de eventos
    } catch (error) {
      console.error('Erro ao criar eventos:', error);
    }
  }

  const [id, setId] = useState(0);

  const handleEventClick = (info) => {
    const clickedEvent = info.event;

    if (clickedEvent && clickedEvent._def) {
      setSelectedEvent(clickedEvent._def.publicId);
      setId(clickedEvent._def.publicId);
      setShowEventModal(true);
    } else {
      console.error("Evento clicado não está definido corretamente");
    }

    calendarApiNew.getEvents().forEach((event) => {
      event.setProp('backgroundColor', ''); // Define para a cor padrão ou '' para remover a cor
    });

    clickedEvent.setProp('backgroundColor', 'green');
    
    // Adicione a chamada para a função de atualização aqui
    updateEvent(clickedEvent._def.publicId);

  };

  const updateEvent = async (id) => {
    const idEvent = { id: id };
    try {
      const response = await axios.post(`http://localhost:5001/updateEvent`, idEvent);
      console.log(response);
    } catch (error) {
      console.error("Erro ao atualizar o evento:", error);
    }
  };

  const deleteEvent = async () => {
    const idEvent = { id: id };
    try {
      if (!idEvent || !id) {
        console.error("Nenhum evento selecionado para excluir ou o evento não tem ID");
        return;
      }

      const response = await axios.delete(`http://localhost:5001/removeEvent/${id}`);
      console.log(response);

      if (response.status === 200) {
        console.log('Evento foi removido com sucesso');

        // Remova o evento do calendário
        const calendarApi = calendarRef.current.getApi();
        const eventToRemove = calendarApi.getEventById(id);

        if (eventToRemove) {
          eventToRemove.remove();
        }

        // Atualiza a lista local de eventos, removendo o evento excluído
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));

        setShowEventModal(false);
      } else {
        console.error("Erro ao excluir o evento.");
      }
    } catch (error) {
      console.error("Erro ao excluir o evento:", error);
    }
  };

  const removeAllEvents = async () => {
    try {
      await axios.delete("http://localhost:5001/removeAllEvents");
      console.log('Todos os eventos foram removidos do banco de dados');

      // Limpa a lista local de eventos
      setEvents([]);
    } catch (error) {
      console.error("Erro ao remover todos os eventos do banco de dados:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-2 mt-6 d-flex flex-column align-items-center">
          <i className="bi bi-calendar3" style={{ fontSize: '4em' }}></i>
          <DatePicker
            selected={miniCalendarDate}
            onChange={handleMiniCalendarDateChange}
            dateFormat="MM/dd/yyyy"
            locale={pt} // Define o idioma para português
            inline // Renderiza o calendário diretamente na página
          />
          <button className="btn btn-secondary btn btn-secondary btn active mb-2 px-2 mt-2" onClick={handleAddEventClick}>
            <i className="bi bi-calendar-plus"></i> Adicionar evento
          </button>
          <CustomModal showModal={showModal} handleCloseNewModal={handleCloseNewModal} handleClose={handleClose} />
          <button className="remove-all-events-button btn btn-secondary btn active mb-2 px-2" onClick={removeAllEvents}>
            <i className="bi bi-calendar-x"></i> Remover eventos
          </button>
        </div>
        <div className=" col-10 mt-2">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={"dayGridMonth"}
            locale={ptBrLocale}
            headerToolbar={{
              start: "today prev,next",
              center: "title",
              end: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height={"90vh"}
            selectable={true}
            events={events} // Usa a lista local de eventos
            eventClick={handleEventClick}
            now={currentDate.toISOString()} // Configura o indicador "now"
            nowIndicator={true} // Ativa o indicador "now"
          />
          <EventModal
            id={id}
            calendarApiNew={calendarApiNew}
            show={showEventModal}
            onClose={() => setShowEventModal(false)}
            onDelete={deleteEvent}
            onUpdate={updateEvent}
          />
        </div>
      </div>
    </div>
  );
}

export default Calendar;