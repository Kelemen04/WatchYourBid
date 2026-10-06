export default function GoogleAuthButton() {
  return (
    <>
      <a href={`${import.meta.env.VITE_BASE_URL}/auth/google`}>
        Login with Google!
      </a>
    </>
  );
}
