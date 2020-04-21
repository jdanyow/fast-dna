import { attr, FASTElement, observable } from "@microsoft/fast-element";
import {
    keyCodeArrowDown,
    keyCodeArrowLeft,
    keyCodeArrowRight,
    keyCodeArrowUp,
    keyCodeEnd,
    keyCodeHome,
    wrapInBounds,
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

    @attr
    public activeid: string;

    @observable
    public tabs: HTMLElement[];
    public tabsChanged(): void {
        if (this.connected && this.tabs.length <= this.tabPanels.length) {
            this.setTabs();
            this.setTabPanels();
            this.handleActiveIndicatorPosition();
        }
    }

    @observable
    public tabPanels: HTMLElement[];
    public tabPanelsChanged(): void {
        if (this.connected && this.tabPanels.length <= this.tabs.length) {
            this.setTabs();
            this.setTabPanels();
            this.handleActiveIndicatorPosition();
        }
    }

    public start: HTMLSlotElement;
    public startContainer: HTMLDivElement;
    public handleStartContentChange(): void {
        this.start.assignedNodes().length > 0
            ? this.startContainer.classList.add("start")
            : this.startContainer.classList.remove("start");
    }

    public end: HTMLSlotElement;
    public endContainer: HTMLDivElement;
    public handleEndContentChange(): void {
        this.end.assignedNodes().length > 0
            ? this.endContainer.classList.add("end")
            : this.endContainer.classList.remove("end");
    }

    @attr({ mode: "boolean" })
    public activeIndicator = true;

    @observable
    public activeIndicatorOffset: number = 0;
    public activeIndicatorRef: HTMLElement;
    public activeTabIndex: number = 0;
    public activeTab: HTMLElement;

    private prevActiveTabIndex: number = 0;
    private ticking: boolean = false;
    private tabIDs: Array<string | null>;
    private tabPanelIDs: Array<string | null>;
    private connected: boolean = false;

    private change = (): void => {
        this.$emit("change", this.activeTab);
    };

    private getActiveIndex(): number {
        if (this.activeid !== undefined) {
            return this.tabIDs.indexOf(this.activeid) === -1
                ? 0
                : this.tabIDs.indexOf(this.activeid);
        } else {
            return 0;
        }
    }

    private setTabs = (): void => {
        this.tabIDs = this.getTabIds();
        this.tabPanelIDs = this.getTabPanelIds();
        this.activeTabIndex = this.getActiveIndex();
        this.tabs.forEach((tab: HTMLElement, index: number) => {
            if (tab.slot === "tab") {
                tab.setAttribute(
                    "id",
                    this.tabIDs[index] === undefined || this.tabIDs[index] === null
                        ? `tab-${index + 1}`
                        : (this.tabIDs[index] as string)
                );
                tab.setAttribute(
                    "aria-selected",
                    this.activeTabIndex === index ? "true" : "false"
                );
                tab.setAttribute(
                    "aria-controls",
                    this.tabPanelIDs[index] === undefined ||
                        this.tabPanelIDs[index] === null
                        ? `panel-${index + 1}`
                        : (this.tabPanelIDs[index] as string)
                );
                tab.setAttribute(
                    "style",
                    this.isHorizontal()
                        ? `grid-column: ${index + 1};`
                        : `grid-row: ${index + 1};`
                );
                tab.addEventListener("click", this.handleTabClick);
                tab.addEventListener("keydown", this.handleTabKeyDown);
                tab.setAttribute("tabindex", this.activeTabIndex === index ? "0" : "-1");
                if (this.activeTabIndex === index) {
                    this.activeTab = tab;
                }
                !this.isHorizontal()
                    ? tab.classList.add("vertical")
                    : tab.classList.remove("vertical");
            }
        });
    };

    private setTabPanels = (): void => {
        this.tabIDs = this.getTabIds();
        this.tabPanelIDs = this.getTabPanelIds();
        this.tabPanels.forEach((tabpanel: HTMLElement, index: number) => {
            tabpanel.setAttribute(
                "id",
                this.tabPanelIDs[index] === undefined || this.tabPanelIDs[index] === null
                    ? `panel-${index + 1}`
                    : (this.tabPanelIDs[index] as string)
            );
            tabpanel.setAttribute(
                "aria-labeledby",
                this.tabIDs[index] === undefined || this.tabIDs[index] === null
                    ? `tab-${index + 1}`
                    : (this.tabIDs[index] as string)
            );
            this.activeTabIndex !== index
                ? tabpanel.setAttribute("hidden", "")
                : tabpanel.removeAttribute("hidden");
        });
    };

    private getTabIds(): Array<string | null> {
        return this.tabs.map((tab: HTMLElement) => {
            return tab.getAttribute("id");
        });
    }

    private getTabPanelIds(): Array<string | null> {
        return this.tabPanels.map((tabPanel: HTMLElement) => {
            return tabPanel.getAttribute("id") as string;
        });
    }

    private setComponent(): void {
        this.activeid = this.tabIDs[this.activeTabIndex] as string;
        this.change();
        this.setTabs();
        this.handleActiveIndicatorPosition();
        this.setTabPanels();
        this.focusTab();
        this.change();
    }

    private handleTabClick = (event: MouseEvent): void => {
        const selectedTab = event.target as HTMLElement;
        this.prevActiveTabIndex = this.activeTabIndex;
        this.activeTabIndex = Array.from(this.tabs).indexOf(selectedTab);
        if (selectedTab.nodeType === 1) {
            this.setComponent();
        }
    };

    private isHorizontal(): boolean {
        return this.orientation === TabsOrientation.horizontal;
    }

    private handleTabKeyDown = (event: KeyboardEvent): void => {
        const keyCode: number = event.keyCode;
        if (this.isHorizontal()) {
            switch (keyCode) {
                case keyCodeArrowLeft:
                    event.preventDefault();
                    this.adjust(-1);
                    break;
                case keyCodeArrowRight:
                    event.preventDefault();
                    this.adjust(1);
                    break;
            }
        } else {
            switch (keyCode) {
                case keyCodeArrowUp:
                    event.preventDefault();
                    this.adjust(-1);
                    break;
                case keyCodeArrowDown:
                    event.preventDefault();
                    this.adjust(1);
                    break;
            }
        }
        switch (keyCode) {
            case keyCodeHome:
                event.preventDefault();
                this.activeTabIndex = 0;
                this.setComponent();
                break;
            case keyCodeEnd:
                event.preventDefault();
                this.activeTabIndex = this.tabs.length - 1;
                this.setComponent();
                break;
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
        const gridProperty: string = this.isHorizontal ? "gridColumn" : "gridRow";
        const translateProperty: string = this.isHorizontal ? "translateX" : "translateY";
        const offsetProperty: string = this.isHorizontal ? "offsetLeft" : "offsetTop";
        const prev: number = this.activeIndicatorRef[offsetProperty];
        this.activeIndicatorRef.style[gridProperty] = `${this.activeTabIndex + 1}`;
        const next: number = this.activeIndicatorRef[offsetProperty];
        this.activeIndicatorRef.style[gridProperty] = `${this.prevActiveTabIndex + 1}`;
        const dif: number = next - prev;
        this.activeIndicatorRef.style.transform = `${translateProperty}(${dif}px)`;
        this.activeIndicatorRef.classList.add("activeIndicatorTransition");
        this.activeIndicatorRef.addEventListener("transitionend", () => {
            this.ticking = false;
            this.activeIndicatorRef.style[gridProperty] = `${this.activeTabIndex + 1}`;
            this.activeIndicatorRef.style.transform = `${translateProperty}(0px)`;
            this.activeIndicatorRef.classList.remove("activeIndicatorTransition");
        });
    }

    private adjust(adjustment: number): void {
        this.prevActiveTabIndex = this.activeTabIndex;
        this.activeTabIndex = wrapInBounds(
            0,
            this.tabs.length - 1,
            this.activeTabIndex + adjustment
        );
        this.setComponent();
    }

    private focusTab(): void {
        this.tabs[this.activeTabIndex].focus();
    }

    constructor() {
        super();

        if (this.connected) {
            this.tabIDs = this.getTabIds();
            this.tabPanelIDs = this.getTabPanelIds();
            this.activeTabIndex = this.getActiveIndex();
        }
    }

    public connectedCallback(): void {
        super.connectedCallback();
        this.connected = true;
    }
}
