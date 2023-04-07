import crypto from "crypto";

const hashText = text => {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export default hashText;
