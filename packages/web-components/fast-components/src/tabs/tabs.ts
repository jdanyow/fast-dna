import { attr, FASTElement, observable } from "@microsoft/fast-element";
import {
    classNames,
    keyCodeArrowDown,
    keyCodeArrowLeft,
    keyCodeArrowRight,
    keyCodeArrowUp,
    keyCodeEnd,
    keyCodeHome,
    Orientation,
} from "@microsoft/fast-web-utilities";

export enum TabsOrientation {
    vertical = "vertical",
    horizontal = "horizontal",
}

export class Tabs extends FASTElement {
    @attr
    public orientation: TabsOrientation = TabsOrientation.horizontal;
    private orientationChanged(): void {
        this.orientation === TabsOrientation.vertical
            ? this.classList.add("vertical")
            : this.classList.remove("vertical");
    }

    @observable
    public tabs: HTMLElement[];
    public tabsChanged(): void {
        if (this.connected) {
            console.log("Tabs", this.tabs);
            this.getTabs(this.activeTabIndex);
        }
    }

    @observable
    public tabPanels: HTMLElement[];
    public tabPanelsChanged(): void {
        if (this.connected) {
            console.log("Tab Panels", this.tabPanels);
            this.getTabPanels(this.activeTabIndex);
        }
    }

    @attr({ mode: "boolean" })
    public activeIndicator = false;

    private activeTabIndex: number = 0;

    @observable
    public activeIndicatorOffset: number = 0;

    public activeIndicatorRef: HTMLElement;

    private prevIndex: number = 0;

    private ticking: boolean = false;

    private tabIDs: string[];
    private tabPanelIDs: string[];

    private getTabs = (selectedTabIndex: number): void => {
        this.tabIDs = this.getTabIds();
        this.tabPanelIDs = this.getTabPanelIds();
        this.tabs.forEach((tab: HTMLElement, index: number) => {
            if (tab.slot === "tab") {
                console.log(this.tabIDs);
                tab.setAttribute(
                    "aria-selected",
                    selectedTabIndex === index ? "true" : "false"
                );
                tab.setAttribute(
                    "aria-controls",
                    this.tabPanelIDs[index] === undefined || null
                        ? `panel-${index}`
                        : this.tabPanelIDs[index]
                );
                tab.setAttribute(
                    "id",
                    this.tabIDs[index] === undefined || null
                        ? `tab-${index}`
                        : this.tabIDs[index]
                );
                tab.setAttribute(
                    "style",
                    this.isHorizontal()
                        ? `grid-column: ${index + 1}; grid-row: 1`
                        : `grid-row: ${index + 1}; grid-column: 2`
                );
                tab.addEventListener("click", this.handleTabClick);
                tab.addEventListener("keydown", this.handleTabKeyDown);
                tab.setAttribute("tabindex", selectedTabIndex === index ? "0" : "-1");
            }
        });
    };

    private validTabPanels(element: HTMLElement): boolean {
        return element.nodeType === 1 && element.getAttribute("role") === "tabpanel";
    }

    private getTabPanels = (selectedTabIndex: number): void => {
        const tp = this.tabPanels.filter(this.validTabPanels);
        this.tabIDs = this.getTabIds();
        this.tabPanelIDs = this.getTabPanelIds();
        console.log("Got Tab IDs", this.tabIDs);
        tp.forEach((tabpanel: HTMLElement, index: number) => {
            tabpanel.setAttribute(
                "aria-labeledby",
                this.tabIDs[index] === undefined || null
                    ? `tab-${index}`
                    : this.tabIDs[index]
            );
            tabpanel.setAttribute(
                "id",
                this.tabPanelIDs[index] === undefined || null
                    ? `panel-${index}`
                    : this.tabPanelIDs[index]
            );
            selectedTabIndex !== index
                ? tabpanel.setAttribute("hidden", "")
                : tabpanel.removeAttribute("hidden");
        });
    };

    private getTabIds(): string[] {
        return this.tabs.map((tab: HTMLElement) => {
            console.log("Tabs gets called");
            return tab.getAttribute("id") as string;
        });
    }

    private getTabPanelIds(): string[] {
        const tp = this.tabPanels.filter(this.validTabPanels);
        return tp.map((tabPanel: HTMLElement) => {
            console.log("TabPanels gets called");
            return tabPanel.getAttribute("id") as string;
        });
    }

    private setTabs(selectedTabIndex: number): void {
        this.getTabs(selectedTabIndex);
        this.handleActiveIndicatorPosition();
        this.getTabPanels(selectedTabIndex);
        this.focusTab(selectedTabIndex);
    }

    private handleTabClick = (event): void => {
        const selectedTab = event.srcElement as Element;
        this.prevIndex = this.activeTabIndex;
        this.activeTabIndex = Array.from(this.tabs).indexOf(event.target);
        if (selectedTab.nodeType === 1) {
            this.setTabs(this.activeTabIndex);
        }
    };

    private isHorizontal(): boolean {
        return this.orientation === TabsOrientation.horizontal;
    }

    private handleTabKeyDown = (event: KeyboardEvent): void => {
        const keyCode: number = event.keyCode;
        const tabsLength: number = this.tabs.length;
        if (this.isHorizontal()) {
            switch (keyCode) {
                case keyCodeArrowLeft:
                    event.preventDefault();
                    this.decrement(tabsLength);
                    break;
                case keyCodeArrowRight:
                    event.preventDefault();
                    this.increment(tabsLength);
                    break;
            }
        } else {
            switch (keyCode) {
                case keyCodeArrowUp:
                    event.preventDefault();
                    this.decrement(tabsLength);
                    break;
                case keyCodeArrowDown:
                    event.preventDefault();
                    this.increment(tabsLength);
                    break;
            }
        }
    };

    private handleActiveIndicatorPosition() {
        if (this.activeIndicator) {
            if (this.ticking) {
                this.activeIndicatorRef.style.transform = "translateX(0px)";
                this.activeIndicatorRef.classList.remove("activeIndicatorTransition");
                if (this.isHorizontal()) {
                    this.activeIndicatorRef.style.gridColumn = `${
                        this.activeTabIndex + 1
                    }`;
                } else {
                    this.activeIndicatorRef.style.gridRow = `${this.activeTabIndex + 1}`;
                }
                this.ticking = false;
            } else {
                this.ticking = true;

                this.animateActiveIndicator();
            }
        }
    }

    private animateActiveIndicator(): void {
        if (this.isHorizontal()) {
            const prev: number = this.activeIndicatorRef.offsetLeft;
            this.activeIndicatorRef.style.gridColumn = `${this.activeTabIndex + 1}`;
            const next: number = this.activeIndicatorRef.offsetLeft;
            this.activeIndicatorRef.style.gridColumn = `${this.prevIndex + 1}`;
            const dif: number = next - prev;
            this.activeIndicatorRef.style.transform = `translateX(${dif}px)`;
            this.activeIndicatorRef.classList.add("activeIndicatorTransition");
            this.activeIndicatorRef.addEventListener("transitionend", () => {
                this.ticking = false;
                this.activeIndicatorRef.style.gridColumn = `${this.activeTabIndex + 1}`;
                this.activeIndicatorRef.style.transform = "translateX(0px)";
                this.activeIndicatorRef.classList.remove("activeIndicatorTransition");
            });
        } else {
            const prev: number = this.activeIndicatorRef.offsetTop;
            this.activeIndicatorRef.style.gridRow = `${this.activeTabIndex + 1}`;
            const next: number = this.activeIndicatorRef.offsetTop;
            this.activeIndicatorRef.style.gridRow = `${this.prevIndex + 1}`;
            const dif: number = next - prev;
            this.activeIndicatorRef.style.transform = `translateY(${dif}px)`;
            this.activeIndicatorRef.classList.add("activeIndicatorTransition");
            this.activeIndicatorRef.addEventListener("transitionend", () => {
                this.ticking = false;
                this.activeIndicatorRef.style.gridRow = `${this.activeTabIndex + 1}`;
                this.activeIndicatorRef.style.transform = "translateX(0px)";
                this.activeIndicatorRef.classList.remove("activeIndicatorTransition");
            });
        }
    }

    private decrement(tabsLength: number): void {
        this.prevIndex = this.activeTabIndex;
        if (this.activeTabIndex !== 0) {
            this.activeTabIndex = this.activeTabIndex - 1;
        } else {
            this.activeTabIndex = tabsLength - 1;
        }
        this.setTabs(this.activeTabIndex);
    }

    private increment(tabsLength: number): void {
        this.prevIndex = this.activeTabIndex;
        if (this.activeTabIndex !== tabsLength - 1) {
            this.activeTabIndex = this.activeTabIndex + 1;
        } else {
            this.activeTabIndex = 0;
        }
        this.setTabs(this.activeTabIndex);
    }

    private focusTab(index: number): void {
        const tb = this.tabs as HTMLElement[];
        tb[index].focus();
    }

    public connectedCallback(): void {
        super.connectedCallback();
        this.connected = true;
    }

    private connected: boolean = false;
}
