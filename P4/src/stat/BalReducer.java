package oldapi;
import java.io.IOException;
import java.util.Iterator;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapred.MapReduceBase;
import org.apache.hadoop.mapred.OutputCollector;
import org.apache.hadoop.mapred.Reducer;
import org.apache.hadoop.mapred.Reporter;

public class BalReducer extends MapReduceBase implements Reducer<Text, DoubleWritable, Text, DoubleWritable> {
	public void reduce(Text key, Iterator<DoubleWritable> values, OutputCollector<Text, DoubleWritable> output, Reporter reporter) throws IOException {
		int equal_0 = 0, equal_1 = 0;
		while (values.hasNext()) {
			if (values.next().get() == 0) {
				equal_0++;
			} else {
				equal_1++;
			}
		}
		double proportion = (equal_0 > equal_1) ? (double) equal_0 / equal_1 : (double) equal_1 / equal_0;
		output.collect(key, new DoubleWritable(proportion));
	}
}
