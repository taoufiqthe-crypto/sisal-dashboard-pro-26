import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("base-class", "additional-class");
    expect(result).toContain("base-class");
    expect(result).toContain("additional-class");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active");
    expect(result).toContain("base-class");
    expect(result).toContain("active");
  });

  it("should handle falsy values", () => {
    const result = cn("base-class", false, null, undefined, "valid-class");
    expect(result).toContain("base-class");
    expect(result).toContain("valid-class");
    expect(result).not.toContain("false");
    expect(result).not.toContain("null");
    expect(result).not.toContain("undefined");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle tailwind merge conflicts", () => {
    const result = cn("px-4", "px-2");
    // Should keep the last px value due to tailwind-merge
    expect(result).toContain("px-2");
    expect(result).not.toContain("px-4");
  });

  it("should handle complex tailwind classes", () => {
    const result = cn(
      "bg-red-500 text-white",
      "hover:bg-red-600",
      "focus:ring-2 focus:ring-red-300"
    );
    expect(result).toContain("bg-red-500");
    expect(result).toContain("text-white");
    expect(result).toContain("hover:bg-red-600");
    expect(result).toContain("focus:ring-2");
    expect(result).toContain("focus:ring-red-300");
  });
});

// Test formatCurrency function
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

describe("formatCurrency utility function", () => {
  it("should format positive numbers correctly", () => {
    expect(formatCurrency(10.50)).toBe("R$ 10,50");
    expect(formatCurrency(1000)).toBe("R$ 1.000,00");
    expect(formatCurrency(1234.56)).toBe("R$ 1.234,56");
  });

  it("should format zero correctly", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });

  it("should format negative numbers correctly", () => {
    expect(formatCurrency(-10.50)).toBe("-R$ 10,50");
    expect(formatCurrency(-1000)).toBe("-R$ 1.000,00");
  });

  it("should handle decimal precision", () => {
    expect(formatCurrency(10.1)).toBe("R$ 10,10");
    expect(formatCurrency(10.99)).toBe("R$ 10,99");
    expect(formatCurrency(10.999)).toBe("R$ 11,00"); // Rounds up
  });

  it("should handle very large numbers", () => {
    expect(formatCurrency(1000000)).toBe("R$ 1.000.000,00");
    expect(formatCurrency(1234567.89)).toBe("R$ 1.234.567,89");
  });
});

// Test date formatting function
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

describe("formatDate utility function", () => {
  it("should format date string correctly", () => {
    const result = formatDate("2024-01-15");
    expect(result).toBe("15/01/2024");
  });

  it("should format Date object correctly", () => {
    const date = new Date("2024-01-15T10:30:00");
    const result = formatDate(date);
    expect(result).toBe("15/01/2024");
  });

  it("should handle current date", () => {
    const today = new Date();
    const result = formatDate(today);
    const expected = today.toLocaleDateString('pt-BR');
    expect(result).toBe(expected);
  });
});

// Test percentage calculation
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

describe("calculatePercentage utility function", () => {
  it("should calculate percentage correctly", () => {
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(50, 200)).toBe(25);
    expect(calculatePercentage(1, 3)).toBe(33); // Rounded
  });

  it("should handle zero total", () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });

  it("should handle zero value", () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  it("should handle equal values", () => {
    expect(calculatePercentage(100, 100)).toBe(100);
  });

  it("should round correctly", () => {
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(2, 3)).toBe(67);
  });
});

// Test array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

describe("groupBy utility function", () => {
  it("should group array by key", () => {
    const data = [
      { id: 1, category: "A", value: 10 },
      { id: 2, category: "B", value: 20 },
      { id: 3, category: "A", value: 30 },
    ];

    const result = groupBy(data, "category");
    
    expect(result).toHaveProperty("A");
    expect(result).toHaveProperty("B");
    expect(result.A).toHaveLength(2);
    expect(result.B).toHaveLength(1);
    expect(result.A[0].id).toBe(1);
    expect(result.A[1].id).toBe(3);
  });

  it("should handle empty array", () => {
    const result = groupBy([], "category");
    expect(result).toEqual({});
  });

  it("should handle single item", () => {
    const data = [{ id: 1, category: "A" }];
    const result = groupBy(data, "category");
    
    expect(result).toHaveProperty("A");
    expect(result.A).toHaveLength(1);
  });
});
