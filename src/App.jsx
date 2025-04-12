import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

function App() {
  const [date, setDate] = useState(new Date());
  const [goals, setGoals] = useState({});
  const [inputGoal, setInputGoal] = useState('');
  const [priority, setPriority] = useState('Medium');

  const formattedDate = date.toISOString().split('T')[0];

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log('Notification permission:', permission);
        });
      }
    }
  }, []);

  // Load goals from localStorage on mount
  useEffect(() => {
    try {
      const storedGoals = localStorage.getItem('goals');
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    } catch (error) {
      console.error('Error loading goals from localStorage:', error);
    }
  }, []);

  // Save to localStorage when goals change
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  // Show notification
  const showNotification = (goalText) => {
    if (!("Notification" in window)) {
      alert("Your browser does not support desktop notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("New Goal Added!", {
        body: goalText,
        icon: "https://cdn-icons-png.flaticon.com/512/565/565547.png",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("New Goal Added!", {
            body: goalText,
            icon: "https://cdn-icons-png.flaticon.com/512/565/565547.png",
          });
        }
      });
    } else {
      console.log('Notification permission denied.');
    }
  };

  const handleAddGoal = () => {
    if (!inputGoal.trim()) return;

    const newGoal = {
      text: inputGoal,
      priority,
    };

    setGoals((prev) => ({
      ...prev,
      [formattedDate]: [...(prev[formattedDate] || []), newGoal],
    }));

    showNotification(inputGoal); // Trigger notification

    setInputGoal('');
    setPriority('Medium');
  };

  return (
    <div className='app'>
      <h1 className='text-center'>React Calendar</h1>

      <div className='calendar-container'>
        <Calendar
          onChange={setDate}
          value={date}
          tileContent={({ date }) => {
            const d = date.toISOString().split('T')[0];
            const dayGoals = goals[d];

            return dayGoals ? (
              <ul className='tile-goals'>
                {dayGoals.slice(0, 2).map((g, i) => (
                  <li key={i} className={`tile-goal ${g.priority.toLowerCase()}`}>
                    {g.text}
                  </li>
                ))}
                {dayGoals.length > 2 && (
                  <li className='tile-goal more'>+{dayGoals.length - 2} more</li>
                )}
              </ul>
            ) : null;
          }}
          tileClassName={({ date }) => {
            const d = date.toISOString().split('T')[0];
            if (d === formattedDate) {
              const priorities = goals[d]?.map(g => g.priority) || [];
              if (priorities.includes('High')) return 'selected-date high';
              if (priorities.includes('Medium')) return 'selected-date medium';
              if (priorities.includes('Low')) return 'selected-date low';
              return 'selected-date';
            }
            return null;
          }}
        />
      </div>

      <p className='text-center'>
        <span className='bold'>Selected Date:</span> {date.toDateString()}
      </p>

      <div className='goals-section'>
        <h2>Goals / Priorities</h2>
        <ul>
          {(goals[formattedDate] || []).map((goal, idx) => (
            <li key={idx}>
              {goal.text}{' '}
              <span className={`tag ${goal.priority.toLowerCase()}`}>{goal.priority}</span>
            </li>
          ))}
        </ul>

        <input
          type='text'
          placeholder='Add a goal...'
          value={inputGoal}
          onChange={(e) => setInputGoal(e.target.value)}
        />

        <div className='priority-buttons'>
          {['High', 'Medium', 'Low'].map((level) => (
            <button
              key={level}
              onClick={() => setPriority(level)}
              className={priority === level ? 'active' : ''}
            >
              {level}
            </button>
          ))}
        </div>

        <button onClick={handleAddGoal} className='add-btn'>Add Goal</button>
      </div>
    </div>
  );
}

export default App;
