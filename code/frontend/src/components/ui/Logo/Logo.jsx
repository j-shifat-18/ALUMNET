import Image from "next/image";
import logo from "../../../../public/logo.png";
import Link from "next/link";

export default function Logo() {
    return (
        <Link href={"/"} className="flex items-center gap-3">
            <Image src={logo} alt="ALUMNET" width={40} height={40}></Image>
            <p className="text-xl text-primary font-bold">ALUMNET</p>
        </Link>
    )
}
