import { useCallback, useState } from "react";
import UseDebounce from "../../../utils/UseDebounce";
import { setIsOpen } from "../../../redux/slices/alertSlice";
import { ClipboardCopy, Copy } from "lucide-react";
import { useAppDispatch } from "../../../redux/store";

type CopyToClipboardProps = {
  css: string;
};

const CopyToClipboard = ({ css }: CopyToClipboardProps) => {
  const [, setIsCopied] = useState(false);
  const dispatch = useAppDispatch();

  const resetCopyState = useCallback(() => {
    dispatch(setIsOpen(false));
    setIsCopied(false);
  }, []);

  const debouncedReset = UseDebounce(resetCopyState, 2000);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(css).then(() => {
      setIsCopied(true);
      dispatch(setIsOpen(true));
      debouncedReset();
    });
  };

  return <ClipboardCopy  onClick={copyToClipboard} size={20}/>;
};

export default CopyToClipboard;
