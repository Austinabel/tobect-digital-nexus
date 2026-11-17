import { startTransition, type FormEvent } from "react";

/**
 * React resets a <form action={…}> after every submission, which wipes what
 * staff typed when the server answers "please fix these fields". Submitting
 * through this handler runs the same action without the reset, so the form
 * keeps its contents and only the error messages change. (The form keeps its
 * `action` too, so it still works before JavaScript loads.)
 */
export function submitWithoutReset(dispatch: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const fd = new FormData(e.currentTarget, submitter instanceof HTMLElement ? submitter : undefined);
    startTransition(() => dispatch(fd));
  };
}
