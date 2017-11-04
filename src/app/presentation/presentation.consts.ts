export const EXAMPLES = {
    templateForms: `<form #formRef="ngForm">
                    ...
                    <input
                            type="text"
                            placeholder="Your full name"
                            required
                            name="name"
                            [(ngModel)]="user?.name">
                        <button type="submit"
                                [disabled]=" formRef?.invalid">
                                Sign up
                        </button>
                        ...
                    </form>`,
    templateFormTypescript: `
                ...
                user: User = {
                  name: 'Junior',
                  account: {
                    email: '',
                    confirm: ''
                  }
                };
                ...`,
    reactiveForms: `
<form [formGroup]="myGroup">
    ...
    Name: 
    <input type="text" formControlName="name">
    Location: 
    <input type="text" formControlName="location">
    ...
</form>
`,
    reactiveFormsCode: `
export RactiveForm {
...                    
    ngOnInit() {
        this.myGroup = new FormGroup({
            name: new FormControl('Todd Motto'),
            location: new FormControl('England, UK')
        });
    }
...
}
`,
    solutionExample: `
    {
    "name": "first-form",
    "addCardClass": true,
    "groupElements": [
        {
            "elements": [
                {
                    "elementsOnLine": [
                        {
                            "name": "headerTemplate",
                            "type": "header",
                            "value": "Runner Information",
                            "classMap": {
                                "heading-1": true
                            }
                        }
                    ]
                }
            ]
        }
    ]
`
};
