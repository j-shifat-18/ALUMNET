import Button from "../../components/ui/button";
import { GoogleIcon } from "../../components/ui/icons";
const GoogleSignInButton = () => {
  return <div className="w-full">
          {}
          <Button variant="outline" iconLeft={<GoogleIcon />} className="w-full">
                    Continue with Google
                </Button>

      </div>;
};
export default GoogleSignInButton;