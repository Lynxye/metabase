import {
  restore,
  popover,
  filterWidget,
  editDashboard,
  saveDashboard,
  visitDashboard,
} from "__support__/e2e/cypress";

import { SAMPLE_DATABASE } from "__support__/e2e/cypress_sample_database";
import { setQuarterAndYear } from "../../native-filters/helpers/e2e-date-filter-helpers";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  query: {
    "source-table": ORDERS_ID,
    expressions: { "CC Date": ["field", ORDERS.CREATED_AT, null] },
  },
};

const parameters = [
  {
    name: "Quarter and Year",
    slug: "quarter_and_year",
    id: "f8ae0c97",
    type: "date/quarter-year",
    sectionId: "date",
  },
];

const dashboardDetails = { parameters };

describe.skip("issue 17775", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();

    cy.createQuestionAndDashboard({ questionDetails, dashboardDetails }).then(
      ({ body: dashboardCard }) => {
        const { dashboard_id } = dashboardCard;

        const updatedSize = { sizeX: 16, sizeY: 8 };

        cy.editDashboardCard(dashboardCard, updatedSize);

        visitDashboard(dashboard_id);
      },
    );

    editDashboard();

    // Make sure filter can be connected to the custom column using UI, rather than using API.
    cy.get("header")
      .find(".Icon-gear")
      .click();

    cy.findByText("Column to filter on")
      .parent()
      .within(() => {
        cy.findByText("Select…").click();
      });

    popover().within(() => {
      cy.findByText("CC Date").click();
    });

    saveDashboard();
  });

  it("should be able to apply dashboard filter to a custom column (metabase#17775)", () => {
    filterWidget().click();

    setQuarterAndYear({ quarter: "Q1", year: "2019" });

    cy.findByText("37.65");

    cy.findAllByText("February 11, 2019, 9:40 PM").should("have.length", 2);
  });
});
