export class ContentCapture {
  private hidden: boolean;
  private variable_stack: any;
  private pos: number;

  constructor(variable_stack: any, hidden: boolean = false) {
    this.hidden = hidden;
    this.variable_stack = variable_stack;
  }

  public enter() {
    this.pos = this.variable_stack["_prefix"].length;
    if (this.hidden) {
      this.variable_stack.push({ _prefix: this.variable_stack["_prefix"] });
    }
    return this;
  }

  public exit() {
    if (this.hidden) {
      const newContent = this.toString();
      this.variable_stack.pop();
      this.variable_stack["_prefix"] += "{{!--GHIDDEN:" + newContent.replace("--}}", "--_END_END") + "--}}";
    }
  }

  public toString() {
    return this.variable_stack["_prefix"].slice(this.pos);
  }

  public iadd(other: any) {
    if (other) {
      this.variable_stack["_prefix"] += other;
    }
    return this;
  }

  public inplaceReplace(old: string, newStr: string) {
    this.variable_stack["_prefix"] = this.variable_stack["_prefix"]
      .slice(0, this.pos)
      + this.variable_stack["_prefix"].slice(this.pos).replace(old, newStr);
  }
};
