import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdDemoPage from "../src/app/demo/AdDemoPage";

describe("Ad demo page", () => {
  it("generates a demo ad and shows the result", async () => {
    render(<AdDemoPage />);

  const btn = screen.getByRole("button", { name: /generate demo ad/i });
  fireEvent.click(btn);

    await waitFor(() => expect(screen.getByText(/status:/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/headline/i)).toBeInTheDocument(), { timeout: 2000 });

    expect(screen.getByText(/Mehr Kunden in 30 Tagen/i)).toBeInTheDocument();
  });
});
