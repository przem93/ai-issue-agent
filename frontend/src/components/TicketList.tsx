import type { Ticket } from '../types';

import { highlightJSON } from '../utils/json';

interface TicketListProps {
  tickets: Ticket[];
}

export const TicketList = ({ tickets }: TicketListProps) => {
  return (
    <div className="tickets-list">
      <h4>Tickets ({tickets.length})</h4>
      {tickets.map((ticket) => (
        <div key={ticket.ticket_id} className="ticket-item">
          <h5>{ticket.ticket_id}: {ticket.title}</h5>
          <div className="ticket-content">
            <div className="ticket-section">
              <strong>Context:</strong>
              <p>{ticket.context}</p>
            </div>
            <div className="ticket-section">
              <strong>Technical Approach:</strong>
              <p>{ticket.technical_approach}</p>
            </div>
            {ticket.scope.length > 0 && (
              <div className="ticket-section">
                <strong>Scope:</strong>
                <ul>
                  {ticket.scope.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ticket.non_scope.length > 0 && (
              <div className="ticket-section">
                <strong>Non-Scope:</strong>
                <ul>
                  {ticket.non_scope.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ticket.files_or_modules.length > 0 && (
              <div className="ticket-section">
                <strong>Files/Modules:</strong>
                <ul>
                  {ticket.files_or_modules.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ticket.acceptance_criteria.length > 0 && (
              <div className="ticket-section">
                <strong>Acceptance Criteria:</strong>
                <ul>
                  {ticket.acceptance_criteria.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ticket.edge_cases.length > 0 && (
              <div className="ticket-section">
                <strong>Edge Cases:</strong>
                <ul>
                  {ticket.edge_cases.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ticket.validation.length > 0 && (
              <div className="ticket-section">
                <strong>Validation:</strong>
                <ul>
                  {ticket.validation.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {ticket.dependencies.length > 0 && (
              <div className="ticket-section">
                <strong>Dependencies:</strong>
                <ul>
                  {ticket.dependencies.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

