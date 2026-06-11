import React from 'react'
import github from "../../../public/github.png";
import Image from 'next/image';

export default function Github() {
  return (
    <div>
        <Image src={github} alt='Github' width={24} height={24}></Image>
    </div>
  )
}
