export default function LoginForm() {
  return (
    <form className="flex flex-col bg-pimary text-center px-20">
      <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
        Username:<br></br>
        <input type="text" className="w-xs border rounded-2xl" />
      </label>
      <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
        Password:<br></br>
        <input type="password" className="w-xs border rounded-2xl" />
      </label>
      <button
        type="button"
        className="text-white mx-30 my-5 bg-gradient-to-r from-background to-primary-hover hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-2xl text-sm px-4 py-2.5 text-center leading-5"
      >
        Login
      </button>
    </form>
  );
}
