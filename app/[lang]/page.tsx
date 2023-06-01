import Image from "next/image";
import styles from "./page.module.css";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

export default async function Home({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <header></header>
      <main>
        <h1>{dict.home.title}</h1>
        <p>{dict.home.description}</p>
      </main>
      <footer>
        <div className={styles.text}>
          <div>
            <p>{dict.footer.addressTitle}</p>
            <p>{dict.footer.address}</p>
          </div>
          <div>
            <p>{dict.footer.scheduleTitle}</p>
            <p>{dict.footer.schedule}</p>
          </div>
        </div>
        <div className={styles.links}>
          <a href="tel:+7 (999) 730 92-73">+7 (999) 730 92-73</a>
          <a href="mailto:cedne@itmo.ru">cedne@itmo.ru</a>
          <a
            href="https://vk.com/cedne.itmo"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://vk.com/cedne.itmo
          </a>
        </div>
      </footer>
    </>
  );
}
