package oldapi;
import java.io.IOException;
import java.lang.InterruptedException;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

public class StatCleanupMapper extends Mapper<LongWritable, Text, Text, DoubleWritable> {
        private static int col = 5;
        private static List<Double> list = new ArrayList<>();
        public void map(LongWritable key, Text value, Context context) throws IOException {
                String line = value.toString();
                String[] parts = line.split(",");
                list.add(Double.parseDouble(parts[col]));
        }
        @Override
        protected void cleanup(Context context) throws IOException, InterruptedException {
                Collections.sort(list);
                context.write(new Text("Max"), new DoubleWritable(list.get(list.size()-1)));
        }
}
