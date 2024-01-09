import Image from 'next/image'
import styles from './page.module.css'
import { ArmViewport } from '@/components/arm-viewport/arm-viewport'

export default function Home() {
  return (
    <main className={styles.main}>
      <ArmViewport/>

      <div style={{width: "300px"}}>
        <input/>
      </div>
    </main>
  )
}
