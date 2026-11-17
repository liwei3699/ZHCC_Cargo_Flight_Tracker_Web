import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlightCards } from "@/components/FlightCards";
import { flights } from "../fixtures";

describe("FlightCards", () => {
  it("renders primary fields and expandable details", () => {
    render(<FlightCards flights={[flights[0]]} />);
    expect(screen.getByText("CZ6376")).toBeInTheDocument();
    expect(screen.getByText("计划起飞")).toBeInTheDocument();
    expect(screen.getByText("到达")).toBeInTheDocument();
    expect(screen.getByText("更多信息")).toBeInTheDocument();
  });
});
