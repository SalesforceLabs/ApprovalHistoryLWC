import { createElement } from "lwc";
import Lookup from "c/lookup";

const SAMPLE_SEARCH_ITEMS = [
  {
    id: "id1",
    icon: "standard:default",
    title: "Sample item 1",
    subtitle: "sub1"
  },
  {
    id: "id2",
    icon: "standard:default",
    title: "Sample item 2",
    subtitle: "sub2"
  }
];

function flushPromises() {
  // eslint-disable-next-line no-undef
  return new Promise(resolve => setImmediate(resolve));
}

describe("handler functions", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("adds a new selection ", () => {
    const element = createElement("c-lookup", {
      is: Lookup
    });
    element.isMultiEntry = false;
    element.setSearchResults(SAMPLE_SEARCH_ITEMS);
    document.body.appendChild(element);

    return flushPromises().then(() => {
      //registering event listener for selectionchange
      const selectionchangeHandler = jest.fn();
      element.addEventListener("selectionchange", selectionchangeHandler);

      //click on one of the selections
      const spanToClick = element.shadowRoot.querySelector(
        ".slds-listbox__option"
      );
      spanToClick.click();
      expect(selectionchangeHandler).toHaveBeenCalled();
      expect(element.selection[0].id).toEqual(SAMPLE_SEARCH_ITEMS[0].id);
    });
  });

  it("validate focus on singleSelect", () => {
    const element = createElement("c-lookup", {
      is: Lookup
    });
    element.selection = SAMPLE_SEARCH_ITEMS[0];
    element.isMultiEntry = false;
    element.setSearchResults(SAMPLE_SEARCH_ITEMS);
    document.body.appendChild(element);

    element.shadowRoot
      .querySelector("input")
      .dispatchEvent(new CustomEvent("focus"));
  });

  it("validate focus on multiSelect", () => {
    const element = createElement("c-lookup", {
      is: Lookup
    });
    element.selection = SAMPLE_SEARCH_ITEMS[0];
    element.isMultiEntry = true;
    element.setSearchResults(SAMPLE_SEARCH_ITEMS);
    document.body.appendChild(element);

    element.shadowRoot
      .querySelector("input")
      .dispatchEvent(new CustomEvent("focus"));
    //nothing to test here
  });

  it("validate blur on multiSelect", () => {
    const element = createElement("c-lookup", {
      is: Lookup
    });
    element.selection = SAMPLE_SEARCH_ITEMS[0];
    element.isMultiEntry = true;
    element.setSearchResults(SAMPLE_SEARCH_ITEMS);
    document.body.appendChild(element);

    element.shadowRoot
      .querySelector("input")
      .dispatchEvent(new CustomEvent("blur"));
  });

  it("validate blur on singleSelect", () => {
    const element = createElement("c-lookup", {
      is: Lookup
    });
    element.selection = SAMPLE_SEARCH_ITEMS[0];
    element.isMultiEntry = false;
    element.setSearchResults(SAMPLE_SEARCH_ITEMS);
    document.body.appendChild(element);

    element.shadowRoot
      .querySelector("input")
      .dispatchEvent(new CustomEvent("blur"));
  });
});
