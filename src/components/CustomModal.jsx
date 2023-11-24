import React from 'react';
import EventForm from './EventForm';

const CustomModal = ({ showModal, handleCloseNewModal, handleClose }) => {

  return (
    <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Criar novo evento</h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <EventForm handleCloseNewModal={handleCloseNewModal} />
          </div>
          <div className="modal-footer">
            {/* <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Fechar
            </button> */}
            {/* Você pode adicionar um botão para salvar aqui se desejar */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
