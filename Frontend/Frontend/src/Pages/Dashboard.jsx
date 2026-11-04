import api from "../ApiClient/api";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  BookOpen,
  CircleAlert,
  Clock3,
  GraduationCap,
  MapPin,
  Megaphone,
} from "lucide-react";

const activities = [
  {
    icon: Megaphone,
    title: "Campus announcements",
    detail: "Check the latest college updates",
    time: "Latest",
    path: "/announcements",
  },
  {
    icon: CalendarDays,
    title: "Campus events",
    detail: "Explore workshops and activities",
    time: "Upcoming",
    path: "/events",
  },
  {
    icon: CircleAlert,
    title: "Campus issue reporting",
    detail: "Report problems around campus",
    time: "Available",
    path: "/issues",
  },
];

const overviewCards = [
  {
    title: "Announcements",
    description: "College news and important updates",
    icon: Megaphone,
    tag: "STAY UPDATED",
    path: "/announcements",
  },
  {
    title: "Campus Events",
    description: "Workshops, activities and events",
    icon: CalendarDays,
    tag: "GET INVOLVED",
    path: "/events",
  },
  {
    title: "Report an Issue",
    description: "Help improve your campus",
    icon: CircleAlert,
    tag: "CAMPUS SUPPORT",
    path: "/issues",
  },
  {
    title: "Study Resources",
    description: "Notes, PDFs and learning material",
    icon: BookOpen,
    tag: "KEEP LEARNING",
    path: "/resources",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [announcementError, setAnnouncementError] = useState("");
  const [eventError, setEventError] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get("/api/announcements/get-ann");

        setAnnouncements(
          Array.isArray(response.data.annoucements)
            ? response.data.annoucements
            : []
        );
      } catch (error) {
        console.error("Announcements error:", error);
        setAnnouncementError("Unable to load announcements.");
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await api.get("/api/events/get-event");

        setEvents(
          Array.isArray(response.data.events)
            ? response.data.events
            : []
        );
      } catch (error) {
        console.error("Events error:", error);
        setEventError("Unable to load campus events.");
      } finally {
        setEventsLoading(false);
      }
    };

    fetchAnnouncements();
    fetchEvents();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = [...events]
    .filter((event) => {
      if (!event.eventDate) return false;

      const eventDate = new Date(event.eventDate);

      return !Number.isNaN(eventDate.getTime()) && eventDate >= today;
    })
    .sort(
      (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
    )
    .slice(0, 3);

  return (
    <div className="page-content">
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            YOUR CAMPUS, CONNECTED
          </div>

          <h1>
            Welcome back!
            <br />
            <span>Your campus workspace.</span>
          </h1>

          <p className="welcome-description">
            Everything happening on campus, organised in one simple place.
          </p>
        </div>

        <div className="date-card">
          <div className="date-icon">
            <CalendarDays size={20} />
          </div>
          <div>
            <span>YOUR WORKSPACE</span>
            <strong>StudentConnect</strong>
          </div>
        </div>
      </section>

      <section className="hero-card">
        <div className="hero-content">
          <span className="hero-label">ONE CAMPUS. ONE PLATFORM.</span>
          <h2>Campus life, made simpler.</h2>
          <p>
            Discover events, stay updated, access learning resources and report
            campus issues without switching between different apps.
          </p>

          <button
            type="button"
            className="hero-button"
            onClick={() => navigate("/locations")}
          >
            Explore campus
            <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="hero-graphic" aria-hidden="true">
          <div className="graphic-ring ring-one" />
          <div className="graphic-ring ring-two" />

          <div className="graphic-center">
            <GraduationCap size={64} strokeWidth={1.2} />
          </div>

          <div className="floating-icon floating-one">
            <CalendarDays size={23} />
          </div>

          <div className="floating-icon floating-two">
            <BookOpen size={23} />
          </div>

          <div className="floating-icon floating-three">
            <MapPin size={23} />
          </div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="section-kicker">CAMPUS OVERVIEW</span>
          <h2>Your campus at a glance</h2>
          <p>Quick access to the services you need every day.</p>
        </div>
      </section>

      <section className="overview-grid">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              type="button"
              className="overview-card"
              key={card.title}
              onClick={() => navigate(card.path)}
            >
              <div className="overview-card-top">
                <div className="overview-icon">
                  <Icon size={22} strokeWidth={1.7} />
                </div>
                <ArrowUpRight size={19} className="card-arrow" />
              </div>

              <span className="card-tag">{card.tag}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </button>
          );
        })}
      </section>

      <section className="section-heading">
        <div>
          <span className="section-kicker">LATEST UPDATES</span>
          <h2>Campus announcements</h2>
          <p>Recent news and important college updates.</p>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => navigate("/announcements")}
        >
          View all
          <ArrowUpRight size={17} />
        </button>
      </section>

      <section className="announcement-list">
        {announcementsLoading ? (
          <p>Loading announcements...</p>
        ) : announcementError ? (
          <p role="alert">{announcementError}</p>
        ) : announcements.length === 0 ? (
          <p>No announcements available yet.</p>
        ) : (
          announcements.slice(0, 3).map((announcement) => (
            <article className="announcement-card" key={announcement._id}>
              <h3>{announcement.title}</h3>
              <p>{announcement.message}</p>
              <p>
                Posted by: {announcement.createdBy?.userName || "Campus Admin"}
              </p>
              <p>
                {announcement.createdAt
                  ? new Date(announcement.createdAt).toLocaleDateString()
                  : ""}
              </p>
            </article>
          ))
        )}
      </section>

      <section className="section-heading">
        <div>
          <span className="section-kicker">WHAT'S HAPPENING</span>
          <h2>Upcoming campus events</h2>
          <p>Keep track of workshops and campus activities.</p>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => navigate("/events")}
        >
          View all
          <ArrowUpRight size={17} />
        </button>
      </section>

      <section className="announcement-list">
        {eventsLoading ? (
          <p>Loading campus events...</p>
        ) : eventError ? (
          <p role="alert">{eventError}</p>
        ) : upcomingEvents.length === 0 ? (
          <p>No upcoming events available yet.</p>
        ) : (
          upcomingEvents.map((event) => (
            <article className="announcement-card" key={event._id}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>Venue: {event.venue}</p>
              <p>
                Date: {new Date(event.eventDate).toLocaleDateString()}
              </p>
              <p>
                Organised by: {event.createdBy?.userName || "Campus Team"}
              </p>
            </article>
          ))
        )}
      </section>

      <section className="bottom-grid">
        <div className="activity-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">QUICK ACCESS</span>
              <h2>Campus activity</h2>
            </div>
            <Clock3 size={20} />
          </div>

          <div className="activity-list">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <button
                  type="button"
                  className="activity-item"
                  key={activity.title}
                  onClick={() => navigate(activity.path)}
                >
                  <div className="activity-icon">
                    <Icon size={19} />
                  </div>

                  <div className="activity-text">
                    <strong>{activity.title}</strong>
                    <span>{activity.detail}</span>
                  </div>

                  <span className="activity-time">{activity.time}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="support-panel">
          <div className="support-icon">
            <MapPin size={23} />
          </div>

          <span className="section-kicker">EXPLORE YOUR CAMPUS</span>
          <h2>Find your way around.</h2>
          <p>
            Access campus locations and find important places around your
            college.
          </p>

          <Link to="/locations" className="text-button">
            Explore locations
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="footer">
        <span>StudentConnect</span>
        <span>One platform for your campus community.</span>
      </footer>
    </div>
  );
}

export default Dashboard;
