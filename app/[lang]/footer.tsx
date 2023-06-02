import { Dictionary } from "@/get-dictionary";
import { faVk } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./page.module.css";

export default function Footer({ dict }: { dict: Dictionary["footer"] }) {
  return (
    <footer className="lg:w-1/2 grid-cols-2 max-sm:grid-cols-1 max-lg:p-8 mx-auto grid gap-6 my-16">
      <div className={styles.text}>
        <div>
          <p>{dict.addressTitle}:</p>
          <p>{dict.address}</p>
        </div>
        <div>
          <p>{dict.scheduleTitle}:</p>
          <p>{dict.schedule}</p>
        </div>
      </div>
      <div className={styles.links}>
        <a href="tel:+7 (999) 730 92-73">
          <FontAwesomeIcon icon={faPhone} className="w-5 h-5" />
          +7 (999) 730 92-73
        </a>
        <a href="mailto:cedne@itmo.ru">
          <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6" />
          cedne@itmo.ru
        </a>
        <a
          href="https://vk.com/cedne_itmo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faVk} className="w-6 h-6" />
          vk.com/cedne_itmo
        </a>
      </div>
    </footer>
  );
}
