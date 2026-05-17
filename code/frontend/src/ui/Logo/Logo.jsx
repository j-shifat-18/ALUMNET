import Image from "next/image";
import logo from "../../../public/logo.png";

export default function Logo() {
    return (
        <div className="flex items-center gap-3">
            <Image src={logo} alt="ALUMNET" width={40} height={40}></Image>
            <p className="text-xl text-primary font-bold">ALUMNET</p>
        </div>
    )
}
